package com.citizen.dashboard;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.image.ImageView;
import javafx.scene.image.Image;

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
    public void initialize() {
        // This method is called by the FXMLLoader when initialization is complete
        
        // In a real application, you would load data from a database or API
        System.out.println("DashboardController initialized.");
        
        // You could load a sample image here if you have one
        // Image image = new Image(getClass().getResourceAsStream("sample_document.jpg"));
        // documentImageView.setImage(image);
    }
    
    @FXML
    private void handleVerify() {
        System.out.println("Verify button clicked");
        // Implement verification logic
    }
    
    @FXML
    private void handleReject() {
        System.out.println("Reject button clicked");
        // Implement rejection logic
    }
}
