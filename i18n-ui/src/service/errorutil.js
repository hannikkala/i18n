import _ from 'lodash';

export class ErrorUtil {

  messages = [];
  index = 0;

  error(message) {
    this.showMessage(message, 'danger');
  }

  info(message) {
    this.showMessage(message, 'info');
  }

  showMessage(message, type) {
    const index = this.index++;
    this.messages.push({
      id: index,
      type,
      message,
    });
    setTimeout(() => {
      _.remove(this.messages, { id: index });
    }, 5000);
  }
}