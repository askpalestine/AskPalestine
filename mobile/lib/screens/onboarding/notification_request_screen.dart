import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/home/home_screen.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:firebase_core/firebase_core.dart';
import 'package:mobile/screens/onboarding/what_screen.dart';
import 'package:mobile/screens/question/question_screen.dart';
import 'package:mobile/services/onboarding_tracker_service.dart';
import 'package:mobile/services/questions_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationRequestScreen extends StatelessWidget {
  const NotificationRequestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              "Notifications Request",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: Theme.of(context).textTheme.headlineMedium?.fontSize,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "We will request your permission to send you notifications when there are newly added answers or for newly added questions.",
              style: TextStyle(
                fontSize: Theme.of(context).textTheme.bodyLarge?.fontSize,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () async {
                FirebaseMessaging messaging = FirebaseMessaging.instance;
                try {
                  NotificationSettings settings =
                      await messaging.requestPermission(
                    alert: true,
                    announcement: false,
                    badge: true,
                    carPlay: false,
                    criticalAlert: false,
                    provisional: false,
                    sound: true,
                  );
                  print(await messaging.getToken());
                } catch (e) {
                  print(e);
                  // ignore: use_build_context_synchronously
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content:
                          const Text('Failed to get notifications permission'),
                      // ignore: use_build_context_synchronously
                      backgroundColor: Theme.of(context).colorScheme.error,
                    ),
                  );
                }
                OnboardingTrackerService onboardingTrackerService =
                    await OnboardingTrackerService.getInstance();
                onboardingTrackerService.markOnboardingDone();
                // ignore: use_build_context_synchronously
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => HomeScreen(),
                  ),
                );
              },
              child: const Text("Next"),
            ),
          ],
        ),
      ),
    );
  }
}
