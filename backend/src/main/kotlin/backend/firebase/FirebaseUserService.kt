package backend.users

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserRecord
import org.springframework.stereotype.Service
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import kotlin.random.Random

@Service
class FirebaseUserService (
    private val mailSender: JavaMailSender
)
{
    // Generate a random password
    private fun generateRandomPassword(length: Int = 12): String {
        val allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#\$%^&*()-_+=<>?"
        return (1..length)
            .map { allowedChars.random() }
            .joinToString("")
    }

    // Create a new user in Firebase Authentication with email and random password
    fun createFirebaseUser(user: Users, sendEmail: Boolean): String {
//        val randomPassword = generateRandomPassword()
        // TODO: Remove this line and uncomment the line above
        val randomPassword = generateRandomPassword()// Generate a random password

        val request = UserRecord.CreateRequest()
            .setEmail(user.email) // Assuming user has an email field; if not, adjust accordingly
            .setEmailVerified(false)
            .setPassword(randomPassword)
            .setDisplayName("${user.firstName} ${user.secondName} ${user.nick} ${user.indexNumber}")
            .setDisabled(false)

        val userRecord = FirebaseAuth.getInstance().createUser(request)
        val additionalClaims = mapOf("userId" to user.userId.toString())
        FirebaseAuth.getInstance().setCustomUserClaims(userRecord.uid, additionalClaims)
        val resetPasswordLink = FirebaseAuth.getInstance().generatePasswordResetLink(user.email)
        if (sendEmail){
            sendPasswordEmail(user.email, resetPasswordLink)
        }
        return userRecord.uid // Return the UID of the newly created Firebase user
    }

    // Send email with the random password to the user
    private fun sendPasswordEmail(email: String, passwordLink: String) {
        val message = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)

        helper.setTo(email)
        helper.setSubject("Your New Account Password")
        helper.setText(
            """
            Cześć,

            Twoje konto w aplikacji OOPS zostało utworzone. Oto link do zresetowania hasła:

            Email:
            $email
            
            Zresetuj hasło:
            $passwordLink

            Pozdrawiamy,
            Zespół OOPS
            """.trimIndent()
        )

        mailSender.send(message)
    }

    // Delete a user from Firebase Authentication
    fun deleteFirebaseUser(uid: String) {
        FirebaseAuth.getInstance().deleteUser(uid)
    }

    // Reset user password and send reset link
    fun resetPassword(email: String): Boolean {
        return try {
            val resetPasswordLink = FirebaseAuth.getInstance().generatePasswordResetLink(email)
            sendResetPasswordEmail(email, resetPasswordLink)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getUserByEmail(email: String): UserRecord {
        return FirebaseAuth.getInstance().getUserByEmail(email)
    }

    // Send password reset email to the user
    private fun sendResetPasswordEmail(email: String, resetPasswordLink: String) {
        val message = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)

        helper.setTo(email)
        helper.setSubject("Reset Your Password")
        helper.setText(
            """
        <p>Cześć,</p>

        <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w aplikacji OOPS. Kliknij poniższy link, aby ustawić nowe hasło:</p>

        <p><a href="$resetPasswordLink">Reset Password</a></p>

        <p>Jeśli nie prosiłeś(-aś) o resetowanie hasła, zignoruj tę wiadomość.</p>

        <p>Pozdrawiamy,<br/>
        Zespół OOPS</p>
        """.trimIndent(), true
        )


        mailSender.send(message)
    }
}
