/**
 * The FormHandler servers as an Immediately-invoked Function Expression. This way we can embed
 * the jQuery event handlers in a class and be dependent on SocketIOConnector.
 *
 * @see http://benalman.com/news/2010/11/immediately-invoked-function-expression/
 */
(function FormHandler() {
    /**
     * When the form is submitted it gets serialized to JSON and sent to the backend using PHP.
     */
    $('#saveNewPlayerForm').submit(function (e) {

        $('#btnSave').toggleClass("disabled");
        var $form = $(this);
        var data = $form.serializeFormJSON();

        data.action = "insert"; // data.action = "update";

        $.post("process.php", data, function (data) {
            console.log(JSON.parse(data).result);
            $('#btnSave').toggleClass("disabled");
        });

        e.preventDefault();
    });

    /**
     * Just some jQuery magic because I was to lazy to type eleven option elements
     */
    $(document).ready(function () {
        for (var i = 1; i <= 11; i++) {
            $('#playerNumber').append('<option value="' + i + '">' + i + '</option>');
        }
    });
}());

