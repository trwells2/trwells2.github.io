<!-- PHP Contact Form Handler (save as contact.php) -->
<!--
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $name = htmlspecialchars($_POST['name']);
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        $message = htmlspecialchars($_POST['message']);

        $to = "trwells2@gmail.com";
        $subject = "New Contact Form Submission";
        $headers = "From: $email\r\nReply-To: $email";
        
        if (mail($to, $subject, $message, $headers)) {
            echo '<script>alert("Message sent successfully!");</script>';
        } else {
            echo '<script>alert("Error sending message.");</script>';
        }
    }
    

    ?>
-->
<?php
header('Content-Type: text/html; charset=UTF-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate inputs
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    // Validate inputs
    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo '<script>alert("All fields are required."); window.location.href="index.php";</script>';
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo '<script>alert("Invalid email address."); window.location.href="index.php";</script>';
        exit;
    }

    // Prepare email
    $to = "trwells2@gmail.com";
    $subject = "New Contact Form Submission from $name";
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: $email\r\nReply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Attempt to send email
    if (mail($to, $subject, $body, $headers)) {
        echo '<script>alert("Message sent successfully!"); window.location.href="index.php";</script>';
    } else {
        http_response_code(500);
        echo '<script>alert("Error sending message. Please try again later."); window.location.href="index.php";</script>';
    }
} else {
    // Handle non-POST requests
    http_response_code(405);
    echo '<script>alert("Method not allowed. Please use the form to submit."); window.location.href="index.php";</script>';
}
?>
