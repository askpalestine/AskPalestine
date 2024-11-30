import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/models/question_model.dart';
import 'package:mobile/constants/backend_constants.dart';

class GetQuestionsResponse {
  final List<QuestionModel> questions;
  final bool isHidingQuestions;
  GetQuestionsResponse(
      {required this.questions, required this.isHidingQuestions});
}

class QuestionsService {
  static Future<GetQuestionsResponse> getQuestions({String? filterText}) async {
    try {
      String uri =
          '${BackendConstants.backendUrl}/questions/?is_android=${Platform.isAndroid}';
      if (filterText != null) {
        uri += '&filter_text=$filterText';
      }
      final Uri url = Uri.parse(uri);
      final response = await http.get(url);
      if (response.statusCode == 200) {
        List<dynamic> questionsJson =
        jsonDecode(utf8.decode(response.bodyBytes));
        return GetQuestionsResponse(
          questions: questionsJson
              .map((json) => QuestionModel.fromJson(json))
              .toList(),
          isHidingQuestions: response.headers.containsKey('x-hiding-questions'),
        );
      } else {
        throw Exception('Failed to load questions');
      }
    } catch (e) {
      throw Exception('Failed to fetch questions: $e');
    }
  }

  static Future<GetQuestionsResponse> searchQuestions({String? searchText}) async {
    try {
      String uri =
          '${BackendConstants.backendUrl}/questions/search/?is_android=${Platform.isAndroid}&search_text=$searchText';
      final Uri url = Uri.parse(uri);
      final response = await http.get(url);
      if (response.statusCode == 200) {
        List<dynamic> questionsJson =
        jsonDecode(utf8.decode(response.bodyBytes));
        return GetQuestionsResponse(
          questions: questionsJson
              .map((json) => QuestionModel.fromJson(json))
              .toList(),
          isHidingQuestions: response.headers.containsKey('x-hiding-questions'),
        );
      } else {
        throw Exception('Failed to load questions');
      }
    } catch (e) {
      throw Exception('Failed to fetch questions: $e');
    }
  }

  static Future<QuestionModel> getQuestion(int id) async {
    try {
      final Uri url = Uri.parse(
          '${BackendConstants.backendUrl}/questions/$id/?is_expert=true&is_android=${Platform.isAndroid}');
      final response = await http.get(url);
      if (response.statusCode == 200) {
        dynamic questionJson = jsonDecode(utf8.decode(response.bodyBytes));
        return QuestionModel.fromJson(questionJson);
      } else {
        throw Exception('Failed to load question');
      }
    } catch (e) {
      throw Exception('Failed to fetch question: $e');
    }
  }

  static Future<GetQuestionsResponse> getUserQuestions(String username) async {
    try {
      final Uri url = Uri.parse(
          '${BackendConstants.backendUrl}/questions/user/$username/?is_android=${Platform.isAndroid}');
      final response = await http.get(url);
      if (response.statusCode == 200) {
        List<dynamic> questionsJson =
            jsonDecode(utf8.decode(response.bodyBytes));
        return GetQuestionsResponse(
          questions: questionsJson
              .map((json) => QuestionModel.fromJson(json))
              .toList(),
          isHidingQuestions: response.headers.containsKey('x-hiding-questions'),
        );
      } else {
        throw Exception('Failed to load user questions');
      }
    } catch (e) {
      throw Exception('Failed to fetch user questions: $e');
    }
  }

  static Future<void> createQuestion(String text) async {
    try {
      final Uri url = Uri.parse('${BackendConstants.backendUrl}/questions/');
      final response = await http.post(
        url,
        body: json.encode({'text': text}),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return;
      } else {
        throw Exception('Failed to create question');
      }
    } catch (e) {
      throw Exception('Failed to create question: $e');
    }
  }

  static Future<void> answerQuestion(int questionId, String answer) async {
    try {
      final Uri url = Uri.parse(
          '${BackendConstants.backendUrl}/questions/$questionId/answer/unverified');
      final response = await http.post(
        url,
        body: json.encode({'text': answer}),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return;
      } else {
        throw Exception('Failed to submit answer to question');
      }
    } catch (e) {
      throw Exception('Failed to submit answer to question: $e');
    }
  }

  static Future<void> reportAnswer(int answerId, String report) async {
    try {
      final Uri url =
          Uri.parse('${BackendConstants.backendUrl}/answers/$answerId/report/');
      final response = await http.put(
        url,
        body: json.encode({'text': report}),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return;
      } else {
        throw Exception('Failed to submit report');
      }
    } catch (e) {
      throw Exception('Failed to submit report: $e');
    }
  }
}
