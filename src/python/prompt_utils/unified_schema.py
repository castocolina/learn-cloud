"""
Unified Prompt Data Schema
=========================

This module defines the unified data structure for prompts that separates
edit metadata from execution metadata, providing clear separation of concerns
between prompt creation and execution tracking.
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import json

@dataclass
class EditMetadata:
    """Metadata related to prompt creation and editing."""
    user_problem: str  # Original user problem description
    additional_context: Optional[str] = None  # Additional context provided by user
    improved_problem: Optional[str] = None  # Solution Strategist improved problem
    improved_context: Optional[str] = None  # Solution Strategist improved context
    questions_asked: List[str] = field(default_factory=list)  # Questions asked during creation
    generation_complete: bool = False  # Whether prompt generation is complete
    router_command: Optional[str] = None  # Command used to generate the prompt
    created: Optional[str] = None  # When prompt was created
    last_edited: Optional[str] = None  # When prompt was last edited
    
    def __post_init__(self):
        """Set creation time if not provided."""
        if not self.created:
            self.created = datetime.now().isoformat()

@dataclass 
class ExecutionResult:
    """Single execution result for a prompt."""
    unit: Optional[str] = None  # Unit executed (for per-unit prompts)
    status: str = 'pending'  # pending, running, completed, failed
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[int] = None  # seconds
    result: Optional[str] = None  # execution result/output
    error_message: Optional[str] = None
    retry_count: int = 0
    model_used: Optional[str] = None  # Actual model used for execution
    
@dataclass
class ExecutionMetadata:
    """Metadata related to prompt execution and results."""
    execution_command: Optional[str] = None  # Command template for execution
    scope_type: str = 'single'  # 'single' or 'per-unit'
    total_iterations: int = 1  # Total number of iterations planned
    results: List[ExecutionResult] = field(default_factory=list)  # All execution results
    last_execution: Optional[str] = None  # Last execution timestamp
    execution_status: str = 'not_started'  # not_started, in_progress, completed, failed, partial
    
    def add_result(self, result: ExecutionResult):
        """Add an execution result."""
        # Remove existing result for same unit if it exists
        self.results = [r for r in self.results if r.unit != result.unit]
        self.results.append(result)
        
        # Update last execution time
        if result.end_time:
            self.last_execution = result.end_time
        elif result.start_time:
            self.last_execution = result.start_time
            
        # Update overall execution status
        self._update_execution_status()
    
    def _update_execution_status(self):
        """Update overall execution status based on results."""
        if not self.results:
            self.execution_status = 'not_started'
            return
            
        statuses = [r.status for r in self.results]
        
        if any(s == 'running' for s in statuses):
            self.execution_status = 'in_progress'
        elif all(s == 'completed' for s in statuses):
            self.execution_status = 'completed'
        elif all(s in ['completed', 'failed'] for s in statuses):
            if any(s == 'completed' for s in statuses):
                self.execution_status = 'partial'
            else:
                self.execution_status = 'failed'
        elif any(s == 'failed' for s in statuses):
            self.execution_status = 'partial'
        else:
            self.execution_status = 'in_progress'

@dataclass
class UnifiedPrompt:
    """Unified prompt data structure with separated edit and execution metadata."""
    # Root-level identification and core fields
    id: str
    short_name: str
    short_description: str
    prompt: str
    execution_scope: str  # 'single' or 'per-unit'
    
    # Agent configuration
    agent_id: str
    agent_name: str
    agent_role: str
    model: str
    framework: str
    fallback_model: Optional[str] = None  # For Claude: automatic fallback if primary model fails
    
    # Status and state
    status: str = 'enabled'  # enabled, disabled, needs_refinement
    
    # Separated metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Initialize metadata structure if not provided."""
        if 'edit' not in self.metadata:
            self.metadata['edit'] = {}
        if 'execution' not in self.metadata:
            self.metadata['execution'] = {}
    
    @property
    def edit_metadata(self) -> EditMetadata:
        """Get edit metadata as structured object."""
        return EditMetadata(**self.metadata.get('edit', {}))
    
    @edit_metadata.setter  
    def edit_metadata(self, value: EditMetadata):
        """Set edit metadata from structured object."""
        self.metadata['edit'] = asdict(value)
    
    @property
    def execution_metadata(self) -> ExecutionMetadata:
        """Get execution metadata as structured object."""
        exec_data = self.metadata.get('execution', {})
        # Handle results that might be dicts
        if 'results' in exec_data and exec_data['results']:
            results = []
            for result_data in exec_data['results']:
                if isinstance(result_data, dict):
                    results.append(ExecutionResult(**result_data))
                else:
                    results.append(result_data)
            exec_data = {**exec_data, 'results': results}
        return ExecutionMetadata(**exec_data)
    
    @execution_metadata.setter
    def execution_metadata(self, value: ExecutionMetadata):
        """Set execution metadata from structured object."""
        self.metadata['execution'] = asdict(value)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for YAML serialization."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UnifiedPrompt':
        """Create from dictionary (from YAML)."""
        return cls(**data)
    
    @classmethod
    def from_legacy_prompt(cls, legacy_data: Dict[str, Any]) -> 'UnifiedPrompt':
        """Create from legacy prompt data structure."""
        # Extract root-level fields
        prompt = cls(
            id=legacy_data.get('id', ''),
            short_name=legacy_data.get('short_name', ''),
            short_description=legacy_data.get('short_description', ''),
            prompt=legacy_data.get('prompt', ''),
            execution_scope=legacy_data.get('execution_scope', 'single'),
            agent_id=legacy_data.get('agent_id', ''),
            agent_name=legacy_data.get('agent_name', ''),
            agent_role=legacy_data.get('agent_role', ''),
            model=legacy_data.get('model', ''),
            framework=legacy_data.get('framework', ''),
            fallback_model=legacy_data.get('fallback_model'),
            status=legacy_data.get('status', 'enabled')
        )
        
        # Migrate edit metadata
        edit_meta = EditMetadata(
            user_problem=legacy_data.get('user_problem', ''),
            additional_context=legacy_data.get('additional_context'),
            improved_problem=legacy_data.get('improved_problem'),
            improved_context=legacy_data.get('improved_context'),
            questions_asked=legacy_data.get('metadata', {}).get('questions_asked', []),
            generation_complete=legacy_data.get('metadata', {}).get('complete', False),
            router_command=legacy_data.get('metadata', {}).get('router_command'),
            created=legacy_data.get('created'),
            last_edited=None
        )
        prompt.edit_metadata = edit_meta
        
        # Migrate execution metadata  
        exec_meta = ExecutionMetadata(
            execution_command=legacy_data.get('metadata', {}).get('execution_command'),
            scope_type=legacy_data.get('metadata', {}).get('scope_type', legacy_data.get('execution_scope', 'single')),
            total_iterations=legacy_data.get('iterations', 1),
            results=[],
            last_execution=legacy_data.get('last_execution'),
            execution_status='not_started'
        )
        
        # Create execution result if there's legacy result data
        if legacy_data.get('last_result') or legacy_data.get('last_execution'):
            result = ExecutionResult(
                status='completed' if legacy_data.get('last_result') else 'pending',
                end_time=legacy_data.get('last_execution'),
                result=legacy_data.get('last_result')
            )
            exec_meta.add_result(result)
        
        prompt.execution_metadata = exec_meta
        
        return prompt
    
    def to_legacy_format(self) -> Dict[str, Any]:
        """Convert back to legacy format for compatibility."""
        edit_meta = self.edit_metadata
        exec_meta = self.execution_metadata
        
        # Get the most recent execution result
        latest_result = None
        if exec_meta.results:
            result_data = exec_meta.results[-1]
            # Handle both dict and ExecutionResult object
            if isinstance(result_data, dict):
                latest_result = ExecutionResult(**result_data)
            else:
                latest_result = result_data
        
        return {
            'id': self.id,
            'short_name': self.short_name,
            'short_description': self.short_description,
            'prompt': self.prompt,
            'agent_id': self.agent_id,
            'agent_name': self.agent_name,
            'agent_role': self.agent_role,
            'model': self.model,
            'framework': self.framework,
            'fallback_model': self.fallback_model,
            'status': self.status,
            'created': edit_meta.created,
            'last_execution': exec_meta.last_execution,
            'iterations': exec_meta.total_iterations,
            'last_result': latest_result.result if latest_result else None,
            'user_problem': edit_meta.user_problem,
            'additional_context': edit_meta.additional_context,
            'execution_scope': self.execution_scope,
            'improved_problem': edit_meta.improved_problem,
            'improved_context': edit_meta.improved_context,
            'metadata': {
                'questions_asked': edit_meta.questions_asked,
                'complete': edit_meta.generation_complete,
                'router_command': edit_meta.router_command,
                'execution_command': exec_meta.execution_command,
                'scope_type': exec_meta.scope_type,
            }
        }


def migrate_prompts_to_unified_schema(prompts_data: Dict[str, Any]) -> Dict[str, Any]:
    """Migrate existing prompts data to unified schema."""
    if 'prompts' not in prompts_data:
        return prompts_data
    
    unified_prompts = []
    for legacy_prompt in prompts_data['prompts']:
        try:
            unified_prompt = UnifiedPrompt.from_legacy_prompt(legacy_prompt)
            unified_prompts.append(unified_prompt.to_dict())
        except Exception as e:
            print(f"Warning: Failed to migrate prompt {legacy_prompt.get('id', 'unknown')}: {e}")
            # Keep original prompt if migration fails
            unified_prompts.append(legacy_prompt)
    
    return {'prompts': unified_prompts}


def convert_to_legacy_format(unified_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert unified format back to legacy format for compatibility."""
    if 'prompts' not in unified_data:
        return unified_data
    
    legacy_prompts = []
    for unified_prompt_data in unified_data['prompts']:
        try:
            unified_prompt = UnifiedPrompt.from_dict(unified_prompt_data)
            legacy_prompts.append(unified_prompt.to_legacy_format())
        except Exception as e:
            print(f"Warning: Failed to convert prompt {unified_prompt_data.get('id', 'unknown')} to legacy: {e}")
            # Keep original if conversion fails
            legacy_prompts.append(unified_prompt_data)
    
    return {'prompts': legacy_prompts}