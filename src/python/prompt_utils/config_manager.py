"""
Configuration Manager for AI Prompt Executor

Handles loading and validation of YAML configuration files.
"""

import logging
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
import yaml
from dataclasses import dataclass, asdict

# Import shared YAML utilities from local module
from .yaml_utils import save_yaml_multiline
from .unified_schema import UnifiedPrompt, migrate_prompts_to_unified_schema, EditStatus, ExecutionStatus

from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class PromptConfig:
    """Data class representing a single prompt configuration."""
    id: str
    prompt: str
    agent_id: str
    agent_role: str
    agent_name: str
    model: str
    framework: str
    status: str
    created: str
    last_execution: Optional[str]
    iterations: int
    last_result: Optional[str]
    user_problem: str
    additional_context: Optional[str]
    execution_scope: str
    metadata: Dict[str, Any]
    short_name: Optional[str] = None
    short_description: Optional[str] = None
    improved_problem: Optional[str] = None
    improved_context: Optional[str] = None
    fallback_model: Optional[str] = None
    
    @property
    def scope_type(self) -> str:
        """Get scope type from metadata."""
        return self.metadata.get('scope_type', 'single')
    
    @property
    def execution_command(self) -> str:
        """Get execution command from metadata."""
        return self.metadata.get('execution_command', '')
    
    @property
    def is_completed(self) -> bool:
        """Check if prompt is marked as completed."""
        return self.metadata.get('complete', False)
    
    @property
    def is_enabled(self) -> bool:
        """Check if prompt is enabled."""
        return self.status == 'enabled'

class ConfigManager:
    """Manages configuration loading and validation."""
    
    def __init__(self, config_path: str = "src/conf/agent_prompts.yaml"):
        self.config_path = Path(config_path)
        self.prompts: List[PromptConfig] = []
        
    def load_prompts(self) -> List[PromptConfig]:
        """Load prompts from YAML configuration file with unified schema migration."""
        if not self.config_path.exists():
            logger.error(f"Configuration file not found: {self.config_path}")
            return []
            
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file)
                
            if 'prompts' not in config_data:
                logger.error("No 'prompts' section found in configuration")
                return []
            
            # Migrate to unified schema if needed
            if config_data['prompts']:
                # Check if any prompt uses legacy structure
                needs_migration = any(
                    prompt.get('metadata', {}).get('execution') is None 
                    and ('user_problem' in prompt or 'last_execution' in prompt)
                    for prompt in config_data['prompts']
                )
                
                if needs_migration:
                    logger.info("Migrating prompts to unified schema...")
                    config_data = migrate_prompts_to_unified_schema(config_data)
                    
                    # Save migrated data
                    try:
                        save_yaml_multiline(config_data, file_path=str(self.config_path))
                        logger.info("Prompts successfully migrated to unified schema")
                    except Exception as e:
                        logger.warning(f"Failed to save migrated prompts: {e}")
                
            prompts = []
            for prompt_data in config_data['prompts']:
                try:
                    prompt = self._create_prompt_config(prompt_data)
                    prompts.append(prompt)
                except Exception as e:
                    logger.warning(f"Failed to parse prompt {prompt_data.get('id', 'unknown')}: {e}")
                    
            self.prompts = prompts
            logger.info(f"Loaded {len(prompts)} prompts from configuration")
            return prompts
            
        except yaml.YAMLError as e:
            logger.error(f"Failed to parse YAML configuration: {e}")
            return []
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            return []
    
    def _create_prompt_config(self, data: Dict[str, Any]) -> PromptConfig:
        """Create a PromptConfig from dictionary data, handling both legacy and unified formats."""
        # Handle unified schema format
        if 'metadata' in data and 'execution' in data.get('metadata', {}):
            # Convert unified format to legacy PromptConfig format for compatibility
            try:
                unified_prompt = UnifiedPrompt.from_dict(data)
                legacy_data = unified_prompt.to_legacy_format()
                data = legacy_data
            except Exception as e:
                logger.warning(f"Failed to convert unified prompt to legacy format: {e}")
        
        # Ensure all required fields have defaults - comprehensive backward compatibility
        defaults = {
            'last_execution': None,
            'last_result': None,
            'additional_context': None,
            'iterations': 1,
            'metadata': {},
            'created': datetime.now().isoformat(),  # Default creation time
            'user_problem': '',  # Default empty user problem
            'short_name': None,
            'short_description': None,
            'improved_problem': None,
            'improved_context': None,
            'fallback_model': None
        }
        
        # Merge defaults with provided data
        for key, default_value in defaults.items():
            data.setdefault(key, default_value)
        
        # Additional validation - ensure required fields are not None
        if not data.get('created'):
            data['created'] = datetime.now().isoformat()
        if data.get('user_problem') is None:
            data['user_problem'] = ''
            
        return PromptConfig(**data)
    
    def get_prompts_by_agent(self, agent_name: str) -> List[PromptConfig]:
        """Get all prompts for a specific agent."""
        return [prompt for prompt in self.prompts if prompt.agent_name == agent_name]
    
    def get_enabled_prompts(self) -> List[PromptConfig]:
        """Get all enabled prompts."""
        return [prompt for prompt in self.prompts if prompt.is_enabled]
    
    def get_pending_prompts(self, agent_name: str = None) -> List[PromptConfig]:
        """Get all pending (not completed) prompts, optionally filtered by agent."""
        prompts = self.prompts
        if agent_name:
            prompts = self.get_prompts_by_agent(agent_name)
            
        return [prompt for prompt in prompts if prompt.is_enabled and not prompt.is_completed]
    
    def get_completed_prompts(self, agent_name: str = None) -> List[PromptConfig]:
        """Get all completed prompts, optionally filtered by agent."""
        prompts = self.prompts
        if agent_name:
            prompts = self.get_prompts_by_agent(agent_name)
            
        return [prompt for prompt in prompts if prompt.is_completed]
    
    def get_available_agents(self) -> List[str]:
        """Get list of all available agents from configuration."""
        agents = set()
        for prompt in self.prompts:
            if prompt.is_enabled:
                agents.add(prompt.agent_name)
        return sorted(list(agents))
    
    def load_agents_config(self) -> Dict[str, Any]:
        """Load agent configurations from agents.yaml file."""
        agents_path = Path("src/conf/agents.yaml")
        
        if not agents_path.exists():
            logger.error(f"Agents configuration file not found: {agents_path}")
            return {'agents': []}
            
        try:
            with open(agents_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file)
                
            if 'agents' not in config_data:
                logger.error("No 'agents' section found in agents configuration")
                return {'agents': []}
                
            logger.info(f"Loaded {len(config_data['agents'])} agent configurations from {agents_path}")
            return config_data
            
        except yaml.YAMLError as e:
            logger.error(f"Error parsing agents YAML file: {e}")
            return {'agents': []}
        except Exception as e:
            logger.error(f"Error loading agents configuration: {e}")
            return {'agents': []}
    
    def save_prompts(self, prompts: List[PromptConfig]) -> bool:
        """Save prompts to YAML configuration file."""
        try:
            # Convert PromptConfig objects to dictionary format
            prompts_data = []
            for prompt in prompts:
                prompt_dict = {
                    'id': prompt.id,
                    'short_name': prompt.short_name,
                    'short_description': prompt.short_description,
                    'prompt': prompt.prompt,
                    'execution_scope': prompt.execution_scope,
                    'agent_id': prompt.agent_id,
                    'agent_name': prompt.agent_name,
                    'agent_role': prompt.agent_role,
                    'model': prompt.model,
                    'framework': prompt.framework,
                    'fallback_model': prompt.fallback_model,
                    'status': prompt.status,
                    'metadata': prompt.metadata,
                    'created': prompt.created,
                    'last_execution': prompt.last_execution,
                    'iterations': prompt.iterations,
                    'last_result': prompt.last_result
                }
                prompts_data.append(prompt_dict)
            
            # Create configuration data structure
            config_data = {'prompts': prompts_data}
            
            # Save to file
            save_yaml_multiline(config_data, file_path=str(self.config_path))
            logger.info(f"Saved {len(prompts)} prompts to configuration")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save prompts: {e}")
            return False
    
    def update_prompt_completion(self, prompt_id: str, unit: str = None) -> bool:
        """Mark a prompt as completed for a specific unit or globally."""
        try:
            # Find the prompt in the original YAML and update it
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file)
                
            updated = False
            for prompt_data in config_data['prompts']:
                if prompt_data['id'] == prompt_id:
                    if unit and prompt_data.get('execution_scope') == 'per-unit':
                        # For per-unit prompts, track completion per unit
                        if 'completed_units' not in prompt_data['metadata']:
                            prompt_data['metadata']['completed_units'] = []
                        if unit not in prompt_data['metadata']['completed_units']:
                            prompt_data['metadata']['completed_units'].append(unit)
                    else:
                        # For single prompts, mark as complete
                        prompt_data['metadata']['complete'] = True
                        
                    prompt_data['last_execution'] = datetime.now().isoformat()
                    updated = True
                    break
                    
            if updated:
                with open(self.config_path, 'w', encoding='utf-8') as file:
                    save_yaml_multiline(config_data, stream=file)
                logger.info(f"Updated completion status for prompt {prompt_id}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to update prompt completion: {e}")
            
        return False
    
    def update_prompt_result(self, prompt_id: str, result: str, unit: str = None) -> bool:
        """Update the last result for a prompt."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file)
                
            updated = False
            for prompt_data in config_data['prompts']:
                if prompt_data['id'] == prompt_id:
                    if unit:
                        # Store result per unit
                        if 'unit_results' not in prompt_data['metadata']:
                            prompt_data['metadata']['unit_results'] = {}
                        prompt_data['metadata']['unit_results'][unit] = {
                            'result': result,
                            'timestamp': datetime.now().isoformat()
                        }
                    else:
                        prompt_data['last_result'] = result
                        
                    updated = True
                    break
                    
            if updated:
                with open(self.config_path, 'w', encoding='utf-8') as file:
                    save_yaml_multiline(config_data, stream=file)
                return True
                
        except Exception as e:
            logger.error(f"Failed to update prompt result: {e}")
            
        return False
    
    def validate_configuration(self) -> List[str]:
        """Validate configuration and return list of issues found."""
        issues = []
        
        if not self.prompts:
            issues.append("No prompts found in configuration")
            return issues
            
        for prompt in self.prompts:
            # Check required fields
            if not prompt.id:
                issues.append("Prompt missing ID")
            if not prompt.prompt:
                issues.append(f"Prompt {prompt.id} missing prompt text")
            if not prompt.agent_name:
                issues.append(f"Prompt {prompt.id} missing agent name")
            if not prompt.execution_command:
                issues.append(f"Prompt {prompt.id} missing execution command")
                
            # Validate scope type
            if prompt.scope_type not in ['single', 'per-unit']:
                issues.append(f"Prompt {prompt.id} has invalid scope type: {prompt.scope_type}")
                
        return issues
    
    # State Management Methods
    def get_prompts_by_edit_status(self, status: EditStatus) -> List[PromptConfig]:
        """Get prompts filtered by edit status."""
        # Convert to UnifiedPrompt format to access status
        unified_prompts = []
        for prompt in self.prompts:
            try:
                # Create legacy format data for conversion
                legacy_data = {
                    'id': prompt.id,
                    'short_name': prompt.short_name,
                    'short_description': prompt.short_description,
                    'prompt': prompt.prompt,
                    'execution_scope': prompt.execution_scope,
                    'agent_id': prompt.agent_id,
                    'agent_name': prompt.agent_name,
                    'agent_role': prompt.agent_role,
                    'model': prompt.model,
                    'framework': prompt.framework,
                    'fallback_model': prompt.fallback_model,
                    'status': prompt.status,
                    'created': prompt.created,
                    'last_execution': prompt.last_execution,
                    'iterations': prompt.iterations,
                    'last_result': prompt.last_result,
                    'user_problem': prompt.user_problem,
                    'additional_context': prompt.additional_context,
                    'improved_problem': prompt.improved_problem,
                    'improved_context': prompt.improved_context,
                    'metadata': prompt.metadata
                }
                
                unified_prompt = UnifiedPrompt.from_legacy_prompt(legacy_data)
                if unified_prompt.edit_status == status:
                    unified_prompts.append(prompt)
            except Exception as e:
                logger.warning(f"Failed to check status for prompt {prompt.id}: {e}")
                
        return unified_prompts
    
    def get_prompts_by_execution_status(self, status: ExecutionStatus) -> List[PromptConfig]:
        """Get prompts filtered by execution status."""
        unified_prompts = []
        for prompt in self.prompts:
            try:
                # Create legacy format data for conversion
                legacy_data = {
                    'id': prompt.id,
                    'short_name': prompt.short_name,
                    'short_description': prompt.short_description,
                    'prompt': prompt.prompt,
                    'execution_scope': prompt.execution_scope,
                    'agent_id': prompt.agent_id,
                    'agent_name': prompt.agent_name,
                    'agent_role': prompt.agent_role,
                    'model': prompt.model,
                    'framework': prompt.framework,
                    'fallback_model': prompt.fallback_model,
                    'status': prompt.status,
                    'created': prompt.created,
                    'last_execution': prompt.last_execution,
                    'iterations': prompt.iterations,
                    'last_result': prompt.last_result,
                    'user_problem': prompt.user_problem,
                    'additional_context': prompt.additional_context,
                    'improved_problem': prompt.improved_problem,
                    'improved_context': prompt.improved_context,
                    'metadata': prompt.metadata
                }
                
                unified_prompt = UnifiedPrompt.from_legacy_prompt(legacy_data)
                if unified_prompt.execution_status == status:
                    unified_prompts.append(prompt)
            except Exception as e:
                logger.warning(f"Failed to check status for prompt {prompt.id}: {e}")
                
        return unified_prompts
    
    def get_editable_prompts(self) -> List[PromptConfig]:
        """Get prompts that can currently be edited."""
        editable = []
        for prompt in self.prompts:
            try:
                # Create legacy format data for conversion
                legacy_data = {
                    'id': prompt.id,
                    'short_name': prompt.short_name,
                    'short_description': prompt.short_description,
                    'prompt': prompt.prompt,
                    'execution_scope': prompt.execution_scope,
                    'agent_id': prompt.agent_id,
                    'agent_name': prompt.agent_name,
                    'agent_role': prompt.agent_role,
                    'model': prompt.model,
                    'framework': prompt.framework,
                    'fallback_model': prompt.fallback_model,
                    'status': prompt.status,
                    'created': prompt.created,
                    'last_execution': prompt.last_execution,
                    'iterations': prompt.iterations,
                    'last_result': prompt.last_result,
                    'user_problem': prompt.user_problem,
                    'additional_context': prompt.additional_context,
                    'improved_problem': prompt.improved_problem,
                    'improved_context': prompt.improved_context,
                    'metadata': prompt.metadata
                }
                
                unified_prompt = UnifiedPrompt.from_legacy_prompt(legacy_data)
                if unified_prompt.is_editable():
                    editable.append(prompt)
            except Exception as e:
                logger.warning(f"Failed to check editability for prompt {prompt.id}: {e}")
                
        return editable
    
    def get_executable_prompts(self) -> List[PromptConfig]:
        """Get prompts that can currently be executed."""
        executable = []
        for prompt in self.prompts:
            try:
                # Create legacy format data for conversion
                legacy_data = {
                    'id': prompt.id,
                    'short_name': prompt.short_name,
                    'short_description': prompt.short_description,
                    'prompt': prompt.prompt,
                    'execution_scope': prompt.execution_scope,
                    'agent_id': prompt.agent_id,
                    'agent_name': prompt.agent_name,
                    'agent_role': prompt.agent_role,
                    'model': prompt.model,
                    'framework': prompt.framework,
                    'fallback_model': prompt.fallback_model,
                    'status': prompt.status,
                    'created': prompt.created,
                    'last_execution': prompt.last_execution,
                    'iterations': prompt.iterations,
                    'last_result': prompt.last_result,
                    'user_problem': prompt.user_problem,
                    'additional_context': prompt.additional_context,
                    'improved_problem': prompt.improved_problem,
                    'improved_context': prompt.improved_context,
                    'metadata': prompt.metadata
                }
                
                unified_prompt = UnifiedPrompt.from_legacy_prompt(legacy_data)
                if unified_prompt.is_executable():
                    executable.append(prompt)
            except Exception as e:
                logger.warning(f"Failed to check executability for prompt {prompt.id}: {e}")
                
        return executable
    
    def update_prompt_edit_status(self, prompt_id: str, new_status: EditStatus) -> bool:
        """Update edit status for a specific prompt."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file)
                
            updated = False
            for prompt_data in config_data['prompts']:
                if prompt_data['id'] == prompt_id:
                    # Ensure metadata structure exists
                    if 'metadata' not in prompt_data:
                        prompt_data['metadata'] = {}
                    if 'edit' not in prompt_data['metadata']:
                        prompt_data['metadata']['edit'] = {}
                    
                    # Update edit status
                    prompt_data['metadata']['edit']['status'] = new_status.value
                    prompt_data['metadata']['edit']['last_edited'] = datetime.now().isoformat()
                    
                    updated = True
                    break
                    
            if updated:
                save_yaml_multiline(config_data, file_path=str(self.config_path))
                logger.info(f"Updated edit status for prompt {prompt_id} to {new_status.value}")
                # Reload prompts to reflect changes
                self.load_prompts()
                return True
                
        except Exception as e:
            logger.error(f"Failed to update edit status for prompt {prompt_id}: {e}")
            
        return False
    
    def update_prompt_execution_status(self, prompt_id: str, new_status: ExecutionStatus) -> bool:
        """Update execution status for a specific prompt."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file)
                
            updated = False
            for prompt_data in config_data['prompts']:
                if prompt_data['id'] == prompt_id:
                    # Ensure metadata structure exists
                    if 'metadata' not in prompt_data:
                        prompt_data['metadata'] = {}
                    if 'execution' not in prompt_data['metadata']:
                        prompt_data['metadata']['execution'] = {}
                    
                    # Update execution status
                    prompt_data['metadata']['execution']['status'] = new_status.value
                    
                    # Update legacy field for compatibility
                    legacy_mapping = {
                        ExecutionStatus.PENDING: 'not_started',
                        ExecutionStatus.RUNNING: 'in_progress',
                        ExecutionStatus.DONE: 'completed',
                        ExecutionStatus.FAILED: 'failed',
                        ExecutionStatus.SKIPPED: 'failed',
                        ExecutionStatus.CANCELLED: 'failed'
                    }
                    prompt_data['metadata']['execution']['execution_status'] = legacy_mapping.get(new_status, 'not_started')
                    
                    if new_status in [ExecutionStatus.RUNNING, ExecutionStatus.DONE, ExecutionStatus.FAILED]:
                        prompt_data['last_execution'] = datetime.now().isoformat()
                    
                    updated = True
                    break
                    
            if updated:
                save_yaml_multiline(config_data, file_path=str(self.config_path))
                logger.info(f"Updated execution status for prompt {prompt_id} to {new_status.value}")
                # Reload prompts to reflect changes
                self.load_prompts()
                return True
                
        except Exception as e:
            logger.error(f"Failed to update execution status for prompt {prompt_id}: {e}")
            
        return False