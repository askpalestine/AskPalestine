import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:mobile/models/question_model.dart';
import 'package:mobile/screens/home/home_screen.dart';
import 'package:flutter/services.dart' show rootBundle, SystemChrome, SystemUiMode, SystemUiOverlayStyle;
import 'package:firebase_core/firebase_core.dart';
import 'package:mobile/screens/onboarding/what_screen.dart';
import 'package:mobile/screens/question/question_screen.dart';
import 'package:mobile/services/onboarding_tracker_service.dart';
import 'package:mobile/services/questions_service.dart';
import 'package:mobile/services/read_tracker_service.dart';
import 'firebase_options.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await setupCertificate();
  runApp(const MyApp());
}

Future<void> setupCertificate() async {
  ByteData certificate = await rootBundle.load('assets/certs/sectigo.cer');
  SecurityContext context = SecurityContext.defaultContext;
  context.setTrustedCertificatesBytes(certificate.buffer.asUint8List());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  static const Color myGreen = Color(0xFF006233);
  static const Color myBlack = Colors.black;
  static const Color myWhite = Colors.white;
  static const Color myRed = Color(0xFFb91122);
  static const Color myBackground = Color(0xFFdfd5ca);

  QuestionModel? question;
  late Future<OnboardingTrackerService> _onboardingTrackerServiceFuture; // Add this line

  @override
  void initState() {
    super.initState();
    _onboardingTrackerServiceFuture =
        OnboardingTrackerService.getInstance(); // Add this line

    FirebaseMessaging.instance.getInitialMessage().then((value) {
      WidgetsBinding.instance!.addPostFrameCallback((_) async {
        await Firebase.initializeApp();
        try {
          QuestionModel question = await QuestionsService.getQuestion(
              int.parse(value!.data['questionId']));
          setState(() {
            this.question = question;
          });
          // ignore: use_build_context_synchronously
        } catch (e) {}
      });
    });
    FirebaseMessaging.instance.getToken().then((token) {
      print('Firebase Token: $token');
    });
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await Firebase.initializeApp();
        try {
          QuestionModel question = await QuestionsService.getQuestion(
              int.parse(message.data['questionId']));
          setState(() {
            this.question = question;
          });
          // ignore: use_build_context_synchronously
        } catch (e) {}
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'AskPalestine',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: const ColorScheme(
            brightness: Brightness.light,
            primary: myGreen,
            onPrimary: myWhite,
            secondary: myBlack,
            onSecondary: myWhite,
            error: myRed,
            onError: myRed,
            surface: myBackground,
            onSurface: myBlack,
          ),
          floatingActionButtonTheme: const FloatingActionButtonThemeData(
            backgroundColor: myGreen,
            foregroundColor: myWhite,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ButtonStyle(
              backgroundColor: MaterialStateProperty.all<Color>(myGreen),
              foregroundColor: MaterialStateProperty.all<Color>(myWhite),
            ),
          ),
          useMaterial3: true,
          textTheme: const TextTheme(
            displayLarge: TextStyle(fontSize: 96, fontWeight: FontWeight.bold),
            displayMedium: TextStyle(fontSize: 60, fontWeight: FontWeight.bold),
            displaySmall: TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
            headlineMedium:
                TextStyle(fontSize: 34, fontWeight: FontWeight.bold),
            headlineSmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            titleLarge: TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
            titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            titleSmall: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            bodyLarge: TextStyle(fontSize: 18),
            bodyMedium: TextStyle(fontSize: 16),
            labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            bodySmall: TextStyle(fontSize: 12),
            labelSmall: TextStyle(fontSize: 10),
          ),
        ),
        home: FutureBuilder<OnboardingTrackerService>(
            future: _onboardingTrackerServiceFuture,
            initialData: null,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const CircularProgressIndicator();
              } else if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                OnboardingTrackerService tracker = snapshot.data!;
                if (tracker.isOnboardingDone()) {
                  return HomeScreen(
                    notificationQuestion: question,
                  );
                }
                return WhatScreen();
              }
            })
        // home:  HomeScreen(notificationQuestionModel: question,),
        );
  }
}
