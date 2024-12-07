package backend.firebase
import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import io.github.cdimascio.dotenv.Dotenv
import org.springframework.context.annotation.Configuration
import javax.annotation.PostConstruct
import java.util.*

@Configuration
class FirebaseConfig {

    @PostConstruct
    fun initFirebase() {

        val dotenv = Dotenv.configure()
            .directory("../") // Adjust the path to your .env file
            .load()

        val base64ServiceAccount = dotenv["FIREBASE_SECRET_JSON_BASE64"]
            ?: throw IllegalStateException("Environment variable 'FIREBASE_SECRET_JSON_BASE64' is not defined.")

        val decodedServiceAccount = Base64.getDecoder().decode(base64ServiceAccount)

        // Set the Firebase options with credentials
        val options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(decodedServiceAccount.inputStream()))
            .build()

        // Initialize the default FirebaseApp instance if not already initialized
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options)
        }
    }
}
