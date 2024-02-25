export function togglePasswordVisibility(event) {
    var target = $(event.target);
    var inputElement = target.parent('.form-group').find('.form-control');
    if (target.hasClass('togglePassword')) {
        if (inputElement.attr('type') === 'password') {
            inputElement.attr('type', 'text');
        }
        else {
            inputElement.attr('type', 'password');
        }
        target.toggleClass('fa-eye-slash');
    }
}
