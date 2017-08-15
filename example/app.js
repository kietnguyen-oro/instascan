// messages in different languages
var I18n = {
  en: {
    redirecting: 'Redirecting to AEON content...',
    invalidContent: 'AEON QR code is invalid',
    noCamera: 'No camera found',
    unsupportedDevice: 'Unsupported device'
  },
  vi: {
    redirecting: 'Đang chuyển tới trang AEON...',
    invalidContent: 'AEON QR code không hợp lệ',
    noCamera: 'Không kiếm được camera',
    unsupportedDevice: 'Thiết bị của bạn chưa được hỗ trợ'
  }
};

// detect language from html
var language = document.documentElement.lang || 'en';
var messages;
if (language === 'vn' || language === 'vi') {
  messages = I18n.vi;
} else {
  messages = I18n[language]
}

// set default settings for notification
$.notify.defaults({
  position: 'top center',
  showAnimation: 'fadeIn',
  showDuration: 200,
  hideAnimation: 'fadeOut',
  hideDuration: 200
});

// qr code scanner
var app = new Vue({
  el: '#app',
  data: {
    scanner: null,
    activeCameraId: null,
    cameras: [],
    scans: []
  },
  mounted: function() {
    var self = this;
    self.scanner = new Instascan.Scanner({
      video: document.getElementById('preview'),
      mirror: false,
      backgroundScan: false,
      scanPeriod: 4
    });
    self.scanner.addListener('scan', function(content, image) {
      var parser = document.createElement('a');
      parser.href = content;
      //console.log('URL hostname:', parser.hostname);
      //console.log('URL pathname:', parser.pathname);

      if (parser.hostname === 'aeon.com.vn' &&
          parser.pathname.substr(0, 11) === '/promotion/' &&
          parser.pathname.length > 11) {
        $.notify(messages.redirecting, {
          className: 'info'
        });
        setTimeout(function() {
          window.location.href = content;
        }, 3000);

      } else {
        $.notify(messages.invalidContent, {
          className: 'error'
        });
      }
    });
    Instascan.Camera.getCameras().then(function(cameras) {
      self.cameras = cameras;
      if (cameras.length > 0) {
        self.activeCameraId = cameras[cameras.length - 1].id;
        self.scanner.start(cameras[cameras.length - 1]);
      } else {
        $.notify(messages.noCamera, {
          className: 'error'
        });
      }
    }).catch(function(e) {
      console.error(e);
      $.notify(messages.unsupportedDevice, {
        className: 'error'
      });
    });
  },
  methods: {
    formatName: function(name) {
      return name || '(unknown)';
    },
    selectCamera: function(camera) {
      this.activeCameraId = camera.id;
      this.scanner.start(camera);
    }
  }
});
