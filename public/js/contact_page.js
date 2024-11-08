function submit() {
    event.preventDefault();
    
    const fullName = document.querySelector('input[name="fullname"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const caseNumber = document.querySelector('input[name="casenumber"]').value;
    const message = document.querySelector('textarea[name="message"]').value;

    const data = {
        fullname: fullName,
        email: email,
        casenumber: caseNumber,
        message: message
    };

    fetch('/submit-contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Your message has been sent successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while sending your message. Please try again later.');
    });
}