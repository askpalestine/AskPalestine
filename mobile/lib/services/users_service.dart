import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:mobile/constants/backend_constants.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:mobile/models/user_model.dart';

class UsersService {
  static Future<UserModel> getUser(String username) async {
    try {
      final Uri url =
          Uri.parse('${BackendConstants.backendUrl}/users/$username/');

      final response = await http.get(url, );
      if (response.statusCode == 200) {
        final userData = jsonDecode(utf8.decode(response.bodyBytes));
        return UserModel.fromJson(userData);
      } else {
        throw Exception('Failed to load user');
      }
    } catch (e) {
      throw Exception('Failed to fetch user: $e');
    }
  }

  static Future<Uint8List> getPhoto(String username) async {
    try {
      final Uri url =
          Uri.parse('${BackendConstants.backendUrl}/users/photo/$username');

      // Check if the photo is already cached
      final file = await DefaultCacheManager().getSingleFile(url.toString());
      if (file != null && await file.exists()) {
        // Return the cached photo
        return await file.readAsBytes();
      }

      // Photo is not cached, fetch it from the network
      final response = await http.get(url);
      if (response.statusCode == 200) {
        // Cache the photo
        await DefaultCacheManager().putFile(url.toString(), response.bodyBytes,
            maxAge: const Duration(days: 7));
        return response.bodyBytes;
      } else {
        throw Exception('Failed to load photo');
      }
    } catch (e) {
      throw Exception('Failed to fetch photo: $e');
    }
  }
}
