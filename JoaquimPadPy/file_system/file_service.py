class FileService:

    def open_file(self, path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def save_file(self, path, content):
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
