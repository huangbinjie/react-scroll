export class Projector {
  private _callback: (items: any[]) => void
  private anchorItem = { index: 0, offset: 0 }
  constructor(
    public divDom: HTMLDivElement,
    public items: any[]
  ) {

  }

  public up() {

  }

  public down() {

  }

  public subscribe(callback: (items: any[]) => void) {
    this._callback = callback
  }
}