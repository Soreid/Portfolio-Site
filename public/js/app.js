(function(app) {
    'use strict';
    const pageItems = {};

    app.indexSetup = () => {
        pageItems.contactButton = document.getElementById('contact-link');
        pageItems.contactContainer = document.getElementById('contact-form-container');
        pageItems.screenDim = document.querySelector('.screen-dim');

        pageItems.contactButton.addEventListener('click', displayContactForm);
        pageItems.screenDim.addEventListener('click', destroyContactForm);
    }

    function displayContactForm(e) {
        createContactForm();
        wireContactForm();
        pageItems.screenDim.classList.remove('hidden');
        pageItems.contactForm = document.querySelector('form');
    }

    function createContactForm() {
        const fragment = new DocumentFragment();
        const contactForm = document.createElement('form');
        contactForm.action = 'POST';
        contactForm.classList.add('contact-form');

        const title = document.createElement('h3');
        title.innerText = 'Contact Me';
        title.id = 'contact-form-title';
        contactForm.append(title);

        contactForm.append(createFormPair('text', 'contact-name', 'Name: '));
        contactForm.append(createFormPair('email', 'contact-email', 'Email: '));
        contactForm.append(createFormPair('textarea', 'contact-message', 'Message: '));

        contactForm.append(createFormButton('submit', 'Submit'));
        contactForm.append(createFormButton('', 'Close'));

        fragment.appendChild(contactForm);
        pageItems.contactContainer.appendChild(fragment);
    }

    function createFormPair(type, id, text) {
        const labelPair = document.createElement('div');
        labelPair.id = `${id}-container`;

        const label = document.createElement('label');
        label.htmlFor = id;
        label.innerText = text;
        labelPair.appendChild(label);

        let input;
        if(type !== 'textarea') {
            input = document.createElement('input');
            input.type = type;
        }
        else {
            input = document.createElement('textarea');
            input.rows = 4;
        }
        input.id = id;
        input.name = id;
        input.setAttribute('required', '');
        labelPair.appendChild(input);

        return labelPair;
    }

    function createFormButton(type, text) {
        const button = document.createElement('button');
        button.type = type;
        button.innerText = text;

        return button;
    }

    function destroyContactForm(e) {
        pageItems.contactForm.remove();
        pageItems.screenDim.classList.add('hidden');
    }

    function wireContactForm() {
        const submitButton = pageItems.contactContainer.querySelector('button');
        submitButton.addEventListener('click', (e) => {
            if(document.querySelector('.contact-form').reportValidity())
            {
                e.preventDefault();

                fetch('/api/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getContactFormData())
                })
                .then(response => alert('Your message was sent successfully.'))
                .catch(error => {
                    alert('There was an issue sending your message. Please try again later.');
                    console.error(error);
                })
                .finally(destroyContactForm());
            }
        });

        const closeButton = submitButton.nextSibling;
        closeButton.addEventListener('click', destroyContactForm);
    }

    function getContactFormData() {
        return {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            message: document.getElementById('contact-message').value
        }
    }

})(window.app = window.app || {});