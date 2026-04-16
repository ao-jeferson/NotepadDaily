class EventBus:

    def __init__(self):
        self._listeners = {}

    def subscribe(self, event, handler):
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(handler)

    def publish(self, event, data=None):
        if event in self._listeners:
            for handler in self._listeners[event]:
                handler(data)
