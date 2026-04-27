package com.workflow.engine.controller;

import com.workflow.engine.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<Map<String, Object>> getPolicyAnalytics(@PathVariable String policyId) {
        return ResponseEntity.ok(analyticsService.getPolicyAnalytics(policyId));
    }
}
