from core.service_container import ServiceContainer
from core.event_bus import EventBus
from file_system.file_service import FileService

def bootstrap():
    container = ServiceContainer()
    event_bus = EventBus()
    file_service = FileService()

    container.register("event_bus", event_bus)
    container.register("file_service", file_service)

    return container
