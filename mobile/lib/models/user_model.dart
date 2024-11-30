class UserModel {
    String username;
    int id;
    String bio;

    UserModel({
        required this.username,
        required this.id,
        required this.bio,
    });

    factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        username: json["username"],
        id: json["id"],
        bio: json["bio"],
    );

    Map<String, dynamic> toJson() => {
        "username": username,
        "id": id,
        "bio": bio,
    };
}
