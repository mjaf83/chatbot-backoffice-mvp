from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field

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
If the user is greeting, just chatting, or asking for general help, route to 'chitchat'.
If the question is specific but doesn't match any datasource, route to 'default'.
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
    # Always allow routing to chitchat, even if no sources exist
    valid_sources = available_categories + ["chitchat", "default"]
    datasources_str = ", ".join(valid_sources)
    
    result = await router.ainvoke({"datasources": datasources_str, "question": question})
    return result.datasource
