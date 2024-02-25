import { togglePasswordVisibility } from "../utils/index.js";

$('#submit_form')
    .on('submit', submitFormData)
    .on('click', togglePasswordVisibility)

function submitFormData(event) {
    event.preventDefault();
    const target = $(event.target);
    const username = target.find('[name="username"]').val();
    const password = target.find('[name="password"]').val();
    const confirmPassword = target.find('[name="confirm_password"]').val();
    if (password === confirmPassword && username) {
        return this.submit();
    }

    target.find('.password-error').removeClass('hidden');
}