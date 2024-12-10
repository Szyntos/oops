package backend.firebase

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

@Configuration
class CorsConfig {

    @Bean
    fun corsFilter(): CorsFilter {
        val source = UrlBasedCorsConfigurationSource()
        val config = CorsConfiguration().apply {
            allowCredentials = true  // Allow credentials like cookies, authorization headers, etc.
            // TODO: Change this to the frontend URL
            allowedOriginPatterns = listOf(System.getProperty("CORS_ALLOWED_ORIGIN") ?: "http://localhost:[*]")  // Allow this origin
            allowedHeaders = listOf("*")  // Allow all headers, including Authorization and Content-Type
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Allow these HTTP methods
            exposedHeaders = listOf("Authorization")  // Expose headers that the client needs to access
        }
        source.registerCorsConfiguration("/**", config)  // Apply this configuration to all endpoints
        return CorsFilter(source)
    }
}
