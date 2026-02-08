from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from database import Base
import enum

class SourceType(enum.Enum):
    MANUAL = "manual"
    FILE = "file"
    SQL_VIEW = "sql_view"

class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    source_type = Column(Enum(SourceType), default=SourceType.MANUAL)
    category = Column(String, index=True, default="general", nullable=False) # e.g. "hr", "sales", "technical"
    
    # For SQL Views

    db_connection_string = Column(String, nullable=True)
    sql_query = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chunks = relationship("DocumentChunk", back_populates="source", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"))
    content = Column(Text)
    embedding = Column(Vector(768))  # nomic-embed-text dimension
    metadata_json = Column(JSON, nullable=True)
    
    source = relationship("KnowledgeSource", back_populates="chunks")
