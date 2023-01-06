// ⚡️ Import Styles
import axios from 'axios';
import feather from 'feather-icons';
import './style.scss';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='qr-code-reader' data-app=''>
    <form data-form=''>
      <input type='file' data-file='' class='visually-hidden'>
      <img src='#' alt='qr-code' data-image='' class='hide'>
      <div>
        ${feather.icons['upload-cloud'].toSvg()}
        <p data-text=''>Upload QR Code to Read</p>
      </div>
    </form>
    <div class='content'>
      <textarea data-textarea='' spellcheck='false' disabled=''></textarea>
      <button data-close=''>Close</button>
      <button data-copy=''>Copy</button>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>`;

// ⚡️ Create class
class App {
  constructor() {
    this.DOM = {
      parent: document.querySelector('[data-app]'),
      form: document.querySelector('[data-form]'),
      formInput: document.querySelector('[data-file]'),
      formImg: document.querySelector('[data-image]'),
      formText: document.querySelector('[data-text]'),
      textarea: document.querySelector('[data-textarea]'),
      closeBtn: document.querySelector('[data-close]'),
      copyBtn: document.querySelector('[data-copy]'),
    };

    this.DOM.form.addEventListener('click', () => this.DOM.formInput.click());
    this.DOM.formInput.addEventListener('change', this.onChange);
    this.DOM.copyBtn.addEventListener('click', this.onCopy);
    this.DOM.closeBtn.addEventListener('click', this.onReset);
  }

  /**
   * @function onCopy - Copy text to clipboard
   */
  onCopy = () => {
    if (this.DOM.textarea.value.trim().length === 0) {
      return
    }
    navigator.clipboard.writeText(this.DOM.textarea.value);
    showNotification('success', 'Text copied successfully to clipboard.');
  };

  /**
   * @function onChange - Input change event handler
   * @param files
   */
  onChange = async ({ target: { files } }) => {
    // Get file
    const file = files[0];
    // Check condition
    if (!file) {
      return;
    }
    // Create formData
    const formData = new FormData();
    formData.append('file', file);
    // Scan image
    await this.onScanner(file, formData);
  };

  /**
   * @function onScanner - Send file and get result
   * @param file
   * @param formData
   * @returns {Promise<void>}
   */
  onScanner = async (file, formData) => {
    this.DOM.formText.innerText = 'Scanning QR Code...';

    try {
      const { data } = await axios.post('https://api.qrserver.com/v1/read-qr-code/', formData);
      const { data: text } = data[0].symbol[0];
      this.DOM.formText.innerText = text ? 'Upload QR Code to Scan' : 'Couldn\'t scan QR Code';
      if (!text) {
        showNotification('warning', 'Couldn\'t scan QR Code');
        this.onReset()
        return;
      }
      this.DOM.textarea.value = text;
      this.DOM.formImg.src = URL.createObjectURL(file);
      this.DOM.formImg.classList.remove('hide');
      this.DOM.form.querySelector('div').classList.add('hide');
      this.DOM.parent.classList.add('is-show');
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      this.DOM.formText.innerText = 'Couldn\'t scan QR Code';
      console.log(e);
    }
  };

  /**
   * @function onReset - Reset application
   */
  onReset = () => {
    this.DOM.formImg.classList.add('hide');
    this.DOM.formImg.src = '#';
    this.DOM.form.reset()
    this.DOM.form.querySelector('div').classList.remove('hide');
    this.DOM.parent.classList.remove('is-show');
  };
}

// ⚡️ Class instance
new App();
