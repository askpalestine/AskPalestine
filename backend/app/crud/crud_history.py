from app.core.models.history import History
from app.core.schemas.history import HistoryCreate, HistoryUpdate
from app.crud.base import CRUDBase


class CRUDHistory(CRUDBase[History, HistoryCreate, HistoryUpdate]):
    ...


history = CRUDHistory(History)
