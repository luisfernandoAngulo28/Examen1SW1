package com.workflow.engine.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    /**
     * Path to the Firebase service account JSON file.
     * Set via FIREBASE_CREDENTIALS_PATH env var or application.properties.
     * Leave empty if using FIREBASE_CREDENTIALS_JSON instead.
     */
    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    /**
     * Full JSON content of the Firebase service account key.
     * Useful for cloud deployments where injecting a file is inconvenient.
     * Set via FIREBASE_CREDENTIALS_JSON env var.
     */
    @Value("${firebase.credentials.json:}")
    private String credentialsJson;

    @PostConstruct
    public void initializeFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return; // Already initialized (e.g. hot-reload)
        }

        try {
            InputStream credentialsStream = resolveCredentials();
            if (credentialsStream == null) {
                log.warn("Firebase no configurado — notificaciones push deshabilitadas. " +
                        "Configura FIREBASE_CREDENTIALS_PATH o FIREBASE_CREDENTIALS_JSON.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase inicializado correctamente.");
        } catch (Exception e) {
            log.error("Error al inicializar Firebase (las notificaciones push estarán deshabilitadas): {}", e.getMessage());
        }
    }

    private InputStream resolveCredentials() throws Exception {
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            return new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8));
        }
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            return new FileInputStream(credentialsPath);
        }
        return null;
    }
}
