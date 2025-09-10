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
from enum import Enum
import json

class EditStatus(Enum):
    """Edit status for prompt development workflow."""
    DRAFT = "draft"              # Initial creation, work in progress
    INCOMPLETE = "incomplete"    # Missing required elements, needs work
    NEEDS_WORK = "needs_work"   # Ready but requires refinement/review
    COMPLETE = "complete"       # Ready for execution

class ExecutionStatus(Enum):
    """Execution status for prompt execution lifecycle."""
    PENDING = "pending"         # Queued for execution
    RUNNING = "running"         # Currently being executed
    DONE = "done"              # Successfully completed
    FAILED = "failed"          # Execution failed
    SKIPPED = "skipped"        # Skipped by user choice
    CANCELLED = "cancelled"    # Cancelled during execution

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
    status: str = EditStatus.DRAFT.value  # Edit workflow status
    
    def __post_init__(self):
        """Set creation time and validate status if not provided."""
        if not self.created:
            self.created = datetime.now().isoformat()
        # Validate status is a valid EditStatus value
        if self.status not in [s.value for s in EditStatus]:
            self.status = EditStatus.DRAFT.value
    
    @property
    def status_enum(self) -> EditStatus:
        """Get status as EditStatus enum."""
        return EditStatus(self.status)
    
    def update_status(self, new_status: EditStatus) -> bool:
        """Update status with validation."""
        if self.can_transition_to(new_status):
            old_status = self.status
            self.status = new_status.value
            self.last_edited = datetime.now().isoformat()
            return True
        return False
    
    def can_transition_to(self, new_status: EditStatus) -> bool:
        """Check if transition to new status is valid."""
        current = EditStatus(self.status)
        
        # Define valid transitions
        valid_transitions = {
            EditStatus.DRAFT: [EditStatus.INCOMPLETE, EditStatus.NEEDS_WORK, EditStatus.COMPLETE],
            EditStatus.INCOMPLETE: [EditStatus.DRAFT, EditStatus.NEEDS_WORK, EditStatus.COMPLETE],
            EditStatus.NEEDS_WORK: [EditStatus.DRAFT, EditStatus.INCOMPLETE, EditStatus.COMPLETE],
            EditStatus.COMPLETE: [EditStatus.DRAFT, EditStatus.INCOMPLETE, EditStatus.NEEDS_WORK]
        }
        
        return new_status in valid_transitions.get(current, [])
    
    def is_editable(self, execution_status: Optional['ExecutionStatus'] = None) -> bool:
        """Check if prompt can be edited based on edit and execution status."""
        # Can't edit if currently pending execution or running
        if execution_status in [ExecutionStatus.PENDING, ExecutionStatus.RUNNING]:
            return False
        return True

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
    timestamp: Optional[str] = None  # Legacy compatibility - execution timestamp
    success: Optional[bool] = None  # Legacy compatibility - success flag
    agent_name: Optional[str] = None  # Legacy compatibility - agent name
    output_preview: Optional[str] = None  # Legacy compatibility - output preview
    
@dataclass
class ExecutionMetadata:
    """Metadata related to prompt execution and results."""
    execution_command: Optional[str] = None  # Command template for execution
    scope_type: str = 'single'  # 'single' or 'per-unit'
    total_iterations: int = 1  # Total number of iterations planned
    results: List[ExecutionResult] = field(default_factory=list)  # All execution results
    last_execution: Optional[str] = None  # Last execution timestamp
    execution_status: str = 'not_started'  # Legacy compatibility - will be migrated to status
    status: str = ExecutionStatus.PENDING.value  # New execution workflow status
    
    def __post_init__(self):
        """Validate and migrate status if needed."""
        # Migrate legacy execution_status to new status system
        if self.execution_status != 'not_started' and self.status == ExecutionStatus.PENDING.value:
            legacy_mapping = {
                'not_started': ExecutionStatus.PENDING,
                'in_progress': ExecutionStatus.RUNNING,
                'completed': ExecutionStatus.DONE,
                'failed': ExecutionStatus.FAILED,
                'partial': ExecutionStatus.FAILED  # Partial is considered failed
            }
            if self.execution_status in legacy_mapping:
                self.status = legacy_mapping[self.execution_status].value
        
        # Validate status is a valid ExecutionStatus value
        if self.status not in [s.value for s in ExecutionStatus]:
            self.status = ExecutionStatus.PENDING.value
    
    @property
    def status_enum(self) -> ExecutionStatus:
        """Get status as ExecutionStatus enum."""
        return ExecutionStatus(self.status)
    
    def update_status(self, new_status: ExecutionStatus) -> bool:
        """Update status with validation."""
        if self.can_transition_to(new_status):
            old_status = self.status
            self.status = new_status.value
            # Keep legacy field in sync for compatibility
            legacy_mapping = {
                ExecutionStatus.PENDING: 'not_started',
                ExecutionStatus.RUNNING: 'in_progress',
                ExecutionStatus.DONE: 'completed',
                ExecutionStatus.FAILED: 'failed',
                ExecutionStatus.SKIPPED: 'failed',
                ExecutionStatus.CANCELLED: 'failed'
            }
            self.execution_status = legacy_mapping.get(new_status, 'not_started')
            return True
        return False
    
    def can_transition_to(self, new_status: ExecutionStatus) -> bool:
        """Check if transition to new status is valid."""
        current = ExecutionStatus(self.status)
        
        # Define valid transitions
        valid_transitions = {
            ExecutionStatus.PENDING: [ExecutionStatus.RUNNING, ExecutionStatus.SKIPPED, ExecutionStatus.CANCELLED],
            ExecutionStatus.RUNNING: [ExecutionStatus.DONE, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED],
            ExecutionStatus.DONE: [ExecutionStatus.PENDING],  # Allow re-execution
            ExecutionStatus.FAILED: [ExecutionStatus.PENDING],  # Allow re-execution
            ExecutionStatus.SKIPPED: [ExecutionStatus.PENDING],  # Allow re-execution
            ExecutionStatus.CANCELLED: [ExecutionStatus.PENDING]  # Allow re-execution
        }
        
        return new_status in valid_transitions.get(current, [])
    
    def is_executable(self, edit_status: EditStatus) -> bool:
        """Check if prompt can be executed based on edit and execution status."""
        # Only execute if edit status is complete
        if edit_status != EditStatus.COMPLETE:
            return False
        
        # Can re-execute completed, failed, skipped, or cancelled prompts
        # Cannot execute if pending or currently running
        return self.status_enum not in [ExecutionStatus.PENDING, ExecutionStatus.RUNNING]
    
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
        edit_data = self.metadata.get('edit', {})
        # Ensure required fields have defaults
        edit_data.setdefault('user_problem', '')
        return EditMetadata(**edit_data)
    
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
                    try:
                        results.append(ExecutionResult(**result_data))
                    except TypeError as e:
                        # Handle potential field mismatches by filtering valid fields
                        valid_fields = set(ExecutionResult.__dataclass_fields__.keys())
                        filtered_data = {k: v for k, v in result_data.items() if k in valid_fields}
                        results.append(ExecutionResult(**filtered_data))
                else:
                    results.append(result_data)
            exec_data = {**exec_data, 'results': results}
        return ExecutionMetadata(**exec_data)
    
    @execution_metadata.setter
    def execution_metadata(self, value: ExecutionMetadata):
        """Set execution metadata from structured object."""
        self.metadata['execution'] = asdict(value)
    
    # State Management Convenience Methods
    @property
    def edit_status(self) -> EditStatus:
        """Get current edit status."""
        return self.edit_metadata.status_enum
    
    @property
    def execution_status(self) -> ExecutionStatus:
        """Get current execution status."""
        return self.execution_metadata.status_enum
    
    def update_edit_status(self, new_status: EditStatus) -> bool:
        """Update edit status with validation."""
        edit_meta = self.edit_metadata
        if edit_meta.update_status(new_status):
            self.edit_metadata = edit_meta
            return True
        return False
    
    def update_execution_status(self, new_status: ExecutionStatus) -> bool:
        """Update execution status with validation."""
        exec_meta = self.execution_metadata
        if exec_meta.update_status(new_status):
            self.execution_metadata = exec_meta
            return True
        return False
    
    def is_editable(self) -> bool:
        """Check if prompt can be edited based on current state."""
        return self.edit_metadata.is_editable(self.execution_status)
    
    def is_executable(self) -> bool:
        """Check if prompt can be executed based on current state."""
        return self.execution_metadata.is_executable(self.edit_status)
    
    def can_transition_edit_to(self, new_status: EditStatus) -> bool:
        """Check if edit status can transition to new status."""
        return self.edit_metadata.can_transition_to(new_status)
    
    def can_transition_execution_to(self, new_status: ExecutionStatus) -> bool:
        """Check if execution status can transition to new status."""
        return self.execution_metadata.can_transition_to(new_status)
    
    def get_status_display(self) -> str:
        """Get formatted status display string."""
        edit_status = self.edit_status.value.replace('_', ' ').title()
        exec_status = self.execution_status.value.replace('_', ' ').title()
        
        if self.execution_status == ExecutionStatus.PENDING:
            return f"Edit: {edit_status}"
        else:
            return f"Edit: {edit_status} | Execution: {exec_status}"
    
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