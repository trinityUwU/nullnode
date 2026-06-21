/** Manual-signaling WebRTC link. No signaling server — SDP travels via dead-drop codes. */
type StateListener = (open: boolean) => void
type MessageListener = (raw: string) => void

/** Resolve once ICE candidate gathering completes (so the SDP is self-contained). */
function waitForIce(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const check = (): void => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check)
        resolve()
      }
    }
    pc.addEventListener('icegatheringstatechange', check)
    setTimeout(resolve, 2500)
  })
}

export class PeerLink {
  private pc: RTCPeerConnection
  private channel?: RTCDataChannel
  private onState: StateListener
  private onMessage: MessageListener

  constructor(onState: StateListener, onMessage: MessageListener) {
    // No iceServers: LAN/host candidates only — fully sovereign, no external relay.
    this.pc = new RTCPeerConnection({ iceServers: [] })
    this.onState = onState
    this.onMessage = onMessage
    this.pc.ondatachannel = (e) => this.bindChannel(e.channel)
  }

  private bindChannel(channel: RTCDataChannel): void {
    this.channel = channel
    channel.onopen = () => this.onState(true)
    channel.onclose = () => this.onState(false)
    channel.onmessage = (e) => this.onMessage(e.data as string)
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.bindChannel(this.pc.createDataChannel('nullnode', { ordered: true }))
    await this.pc.setLocalDescription(await this.pc.createOffer())
    await waitForIce(this.pc)
    // localDescription is non-null after a successful setLocalDescription.
    return this.pc.localDescription as RTCSessionDescriptionInit
  }

  async acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.pc.setRemoteDescription(offer)
    await this.pc.setLocalDescription(await this.pc.createAnswer())
    await waitForIce(this.pc)
    // localDescription is non-null after a successful setLocalDescription.
    return this.pc.localDescription as RTCSessionDescriptionInit
  }

  async acceptAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.pc.setRemoteDescription(answer)
  }

  send(raw: string): void {
    if (this.channel?.readyState === 'open') this.channel.send(raw)
  }

  close(): void {
    this.channel?.close()
    this.pc.close()
  }
}
