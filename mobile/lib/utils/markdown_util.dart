class MarkdownUtil {
      static String preprocessText(String text) {
      // // Replace "&nbsp;" with "\n"
      // text = text.replaceAll('&nbsp;', '\n');
      //
      // Remove ">" character if it starts the line and replace it with "&nbsp;" on a line of its own
      text = text.replaceAllMapped(
        RegExp(r'>[ ]*'),
        (_) => '\n',
      );

      return text;
    }
}