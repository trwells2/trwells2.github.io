<!-- PHP Contact Form Handler (save as contact.php) -->
    <?php
    
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