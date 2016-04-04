class vplayer {
  constructor(url, container) {
    this._container = container;
    this._url = url;
    this._isPlaying = false;
    this._render();
  }

  render() {
    ReactDOM.render(
      <VideoPlayer url={this._url} playing={this._isPlaying} />,
      this._container
    );
  }

  get url() {
    return this._url;
  }

  set url(value) {
    this._url = value;
    this._render();
  }

  play() {
    this._isPlaying = true;
    this._render();
  }

  pause() {
    this._isPlaying = false;
    this._render();
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this._container);
  }
}