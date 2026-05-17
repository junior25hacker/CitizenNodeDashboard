package com.citizen.dashboard;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.image.ImageView;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;

public class DashboardController {

    @FXML
    private Label nameLabel;
    @FXML
    private Label idLabel;
    @FXML
    private Label dobLabel;
    @FXML
    private Label hospitalLabel;
    @FXML
    private ImageView documentImageView;
    @FXML
    private Label matchScoreLabel;
    @FXML
    private ProgressBar matchProgressBar;

    private String extractedOcrText = "REPUBLIC OF CAMEROON CERTIFICATE OF BIRTH. This certifies that EUNICE TCHOUELA was born on 25/06/2007 at the Yaoundé General Hospital Registry Center.";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String BACKEND_API_URL = "http://localhost:3000/api/v1/documents";

    @FXML
    public void initialize() {
        System.out.println("Admin Dashboard Controller initialized.");

        nameLabel.setText("Eunice Tchouela");
        idLabel.setText("CITIZEN-9921");
        dobLabel.setText("25/06/2007");
        hospitalLabel.setText("Yaoundé General Hospital Registry Center");

        initializeOCR();
        computeMatches();
    }

    private void initializeOCR() {
        System.out.println("Initializing Optical Character Recognition (OCR) Engine...");
    }

    private void computeMatches() {
        System.out.println("Executing automated cross-reference checks...");

        String expectedName = nameLabel.getText().toLowerCase();
        String ocrTextLower = extractedOcrText.toLowerCase();

        if (ocrTextLower.contains(expectedName)) {
            matchScoreLabel.setText("Match Score: 100% (Exact Entity Located)");
            matchProgressBar.setProgress(1.0);
            matchProgressBar.setStyle("-fx-accent: #22c55e;");
        } else {
            double similarity = calculateSimilarity(expectedName, ocrTextLower);
            matchScoreLabel.setText(String.format("Match Score: %.1f%% (Fuzzy Variance)", similarity * 100));
            matchProgressBar.setProgress(similarity);

            if (similarity < 0.6) {
                matchProgressBar.setStyle("-fx-accent: #ef4444;");
            } else {
                matchProgressBar.setStyle("-fx-accent: #f59e0b;");
            }
        }
    }

    private double calculateSimilarity(String s1, String s2) {
        int maxLength = Math.max(s1.length(), s2.length());
        if (maxLength == 0)
            return 1.0;

        int[] costs = new int[s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) {
            int lastValue = i;
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        int newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length()] = lastValue;
        }
        return (maxLength - costs[s2.length()]) / (double) maxLength;
    }

    @FXML
    private void handleReRunAI() {
        System.out.println("Re-indexing file variables...");
        computeMatches();
    }

    @FXML
    private void handleVerify() {
        System.out.println("Processing System Verification Approval...");
        sendDecisionToBackend("VERIFIED");
    }

    @FXML
    private void handleReject() {
        System.out.println("Processing System Verification Rejection...");
        sendDecisionToBackend("REJECTED");
    }

    private void sendDecisionToBackend(String status) {
        try {
            String documentId = idLabel.getText();
            String jsonPayload = String.format("{\"status\":\"%s\",\"verifiedBy\":\"Admin-01\"}", status);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BACKEND_API_URL + "/" + documentId + "/verify-status"))
                    .header("Content-Type", "application/json")
                    .POST(BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, BodyHandlers.ofString())
                    .thenApply(HttpResponse::body)
                    .thenAccept(responseBody -> {
                        System.out.println("Database Updated. Response payload received: " + responseBody);
                    })
                    .exceptionally(ex -> {
                        System.err.println("API Handshake Failed: " + ex.getMessage());
                        return null;
                    });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}