window.WQPForms = {
  formToObject(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }
};
