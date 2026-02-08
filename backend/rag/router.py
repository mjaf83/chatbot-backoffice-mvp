from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_core.pydantic_v1 import BaseModel, Field

# Define Output Structure
class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""
    datasource: str = Field(
        ...,
        description="Given a user question choose which datasource would be most relevant for answering their question",
    )

llm = ChatOllama(model="llama3.1", temperature=0)
# Llama 3.1 supports structured output via json mode or tools, Langchain handles this.
structured_llm_router = llm.with_structured_output(RouteQuery)

# Prompt
system = """You are an expert at routing a user question to a vectorstore or datasource.
The available datasources are: {datasources}.
Return the name of the datasource that best matches the user question.
If the question is general conversation, route to 'default'.
"""
route_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

router = route_prompt | structured_llm_router

async def route_question(question: str, available_categories: List[str]):
    """
    Determines the category/datasource for a given question.
    """
    if not available_categories:
        return "default"
        
    datasources_str = ", ".join(available_categories)
    result = await router.ainvoke({"datasources": datasources_str, "question": question})
    return result.datasource
