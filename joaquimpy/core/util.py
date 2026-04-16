from datetime import datetime

class Util:
    @staticmethod
    def current_datetime_tab_name():
        return datetime.now().strftime("%Y-%m-%d %H-%M")