"""
Test suite for verifying metadata preservation in execution engine.

This test specifically verifies that when _update_yaml_metadata() is called
on one prompt, the metadata.execution fields of all OTHER prompts remain
completely intact and untouched.
"""

import pytest
import tempfile
import yaml
import asyncio
import os
from pathlib import Path
from unittest.mock import Mock, patch
from datetime import datetime

# Import modules under test
from src.python.prompt_utils.execution_engine import ExecutionEngine
from src.python.prompt_utils.config_manager import ConfigManager, PromptConfig
from src.python.prompt_utils.state_manager import StateManager
from src.python.prompt_utils.agent_handler import AgentExecutionResult


class TestMetadataPreservation:
    """Test class for metadata preservation bug fix."""
    
    @pytest.fixture
    def temp_yaml_file(self):
        """Create a temporary YAML file with test data."""
        test_data = {
            'prompts': [
                {
                    'id': 'test-prompt-1',
                    'short_name': 'Test Prompt 1',
                    'short_description': 'First test prompt',
                    'prompt': 'Test prompt content 1',
                    'execution_scope': 'single',
                    'agent_id': 'claude',
                    'agent_name': 'claude-sonnet-3.5',
                    'agent_role': 'general',
                    'model': 'claude-3.5-sonnet',
                    'framework': 'anthropic',
                    'fallback_model': None,
                    'status': 'enabled',
                    'metadata': {
                        'execution': {
                            'execution_command': 'test command 1',
                            'scope_type': 'single',
                            'total_iterations': 1,
                            'results': [
                                {
                                    'unit': None,
                                    'timestamp': '2025-01-01T10:05:00',
                                    'duration': 300,
                                    'success': True,
                                    'agent_name': 'claude-sonnet-3.5',
                                    'output_preview': 'Original test result 1',
                                    'error_message': None
                                }
                            ],
                            'last_execution': '2025-01-01T10:05:00',
                            'execution_status': 'completed'
                        }
                    },
                    'created': '2025-01-01T09:00:00',
                    'last_execution': '2025-01-01T10:05:00',
                    'iterations': 1,
                    'last_result': 'Test result 1'
                },
                {
                    'id': 'test-prompt-2',
                    'short_name': 'Test Prompt 2',
                    'short_description': 'Second test prompt',
                    'prompt': 'Test prompt content 2',
                    'execution_scope': 'per-unit',
                    'agent_id': 'claude',
                    'agent_name': 'claude-sonnet-3.5',
                    'agent_role': 'general',
                    'model': 'claude-3.5-sonnet',
                    'framework': 'anthropic',
                    'fallback_model': None,
                    'status': 'enabled',
                    'metadata': {
                        'execution': {
                            'execution_command': 'test command 2',
                            'scope_type': 'per-unit',
                            'total_iterations': 2,
                            'results': [
                                {
                                    'unit': 'unit-1',
                                    'timestamp': '2025-01-01T11:03:00',
                                    'duration': 180,
                                    'success': True,
                                    'agent_name': 'claude-sonnet-3.5',
                                    'output_preview': 'Original test result 2-1',
                                    'error_message': None
                                },
                                {
                                    'unit': 'unit-2',
                                    'timestamp': '2025-01-01T11:08:00',
                                    'duration': 180,
                                    'success': True,
                                    'agent_name': 'claude-sonnet-3.5',
                                    'output_preview': 'Original test result 2-2',
                                    'error_message': None
                                }
                            ],
                            'last_execution': '2025-01-01T11:08:00',
                            'execution_status': 'completed'
                        }
                    },
                    'created': '2025-01-01T09:30:00',
                    'last_execution': '2025-01-01T11:08:00',
                    'iterations': 2,
                    'last_result': 'Test result 2-2'
                },
                {
                    'id': 'test-prompt-3',
                    'short_name': 'Test Prompt 3',
                    'short_description': 'Third test prompt',
                    'prompt': 'Test prompt content 3',
                    'execution_scope': 'single',
                    'agent_id': 'claude',
                    'agent_name': 'claude-sonnet-3.5',
                    'agent_role': 'general',
                    'model': 'claude-3.5-sonnet',
                    'framework': 'anthropic',
                    'fallback_model': None,
                    'status': 'enabled',
                    'metadata': {
                        'execution': {
                            'execution_command': 'test command 3',
                            'scope_type': 'single',
                            'total_iterations': 1,
                            'results': [
                                {
                                    'unit': None,
                                    'timestamp': '2025-01-01T12:02:00',
                                    'duration': 120,
                                    'success': False,
                                    'agent_name': 'claude-sonnet-3.5',
                                    'output_preview': None,
                                    'error_message': 'Original test error 3'
                                }
                            ],
                            'last_execution': '2025-01-01T12:02:00',
                            'execution_status': 'failed'
                        }
                    },
                    'created': '2025-01-01T10:00:00',
                    'last_execution': '2025-01-01T12:02:00',
                    'iterations': 1,
                    'last_result': None
                }
            ]
        }
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False)
        yaml.dump(test_data, temp_file, default_flow_style=False)
        temp_file.close()
        
        yield temp_file.name
        
        # Cleanup
        os.unlink(temp_file.name)
    
    @pytest.fixture
    def execution_engine(self, temp_yaml_file):
        """Create execution engine with temporary config."""
        config_manager = ConfigManager(temp_yaml_file)
        state_manager = Mock(spec=StateManager)
        
        # Mock state manager methods
        state_manager.get_completed_units.return_value = []
        state_manager.load_execution_states.return_value = []
        state_manager.save_execution_states.return_value = None
        
        engine = ExecutionEngine(config_manager, state_manager)
        
        # Mock detect_available_units to avoid dependency on filesystem
        engine.detect_available_units = Mock(return_value=['unit-1', 'unit-2'])
        
        return engine
    
    def load_yaml_data(self, yaml_file_path):
        """Load YAML data from file."""
        with open(yaml_file_path, 'r', encoding='utf-8') as file:
            return yaml.safe_load(file)
    
    def get_prompt_metadata_execution(self, yaml_data, prompt_id):
        """Get metadata.execution for specific prompt."""
        for prompt in yaml_data['prompts']:
            if prompt['id'] == prompt_id:
                return prompt['metadata']['execution']
        return None
    
    @pytest.mark.asyncio
    async def test_metadata_preservation_single_prompt_update(self, execution_engine, temp_yaml_file):
        """
        Test that updating metadata for one prompt doesn't affect others.
        
        This is the core test for the bug fix:
        1. Load initial state and capture all metadata.execution data
        2. Update one prompt (test-prompt-2) 
        3. Verify other prompts (test-prompt-1, test-prompt-3) are unchanged
        4. Verify target prompt (test-prompt-2) was correctly updated
        """
        # Load initial state
        initial_data = self.load_yaml_data(temp_yaml_file)
        initial_prompt1_metadata = self.get_prompt_metadata_execution(initial_data, 'test-prompt-1')
        initial_prompt2_metadata = self.get_prompt_metadata_execution(initial_data, 'test-prompt-2')
        initial_prompt3_metadata = self.get_prompt_metadata_execution(initial_data, 'test-prompt-3')
        
        # Verify initial state exists
        assert initial_prompt1_metadata is not None
        assert initial_prompt2_metadata is not None
        assert initial_prompt3_metadata is not None
        assert len(initial_prompt1_metadata['results']) == 1
        assert len(initial_prompt2_metadata['results']) == 2
        assert len(initial_prompt3_metadata['results']) == 1
        
        # Create mock prompt and execution result for update
        target_prompt = PromptConfig(
            id='test-prompt-2',
            prompt='Test prompt content 2',
            agent_id='claude',
            agent_role='general',
            agent_name='claude-sonnet-3.5',
            model='claude-3.5-sonnet',
            framework='anthropic',
            status='enabled',
            created='2025-01-01T09:30:00',
            last_execution=None,
            iterations=2,
            last_result=None,
            user_problem='Test problem',
            additional_context=None,
            execution_scope='per-unit',
            metadata={'scope_type': 'per-unit'}
        )
        
        execution_result = AgentExecutionResult(
            success=True,
            output='New execution result for unit-3',
            error=None,
            duration=250,
            limit_hit=False
        )
        
        # Update metadata for test-prompt-2
        await execution_engine._update_yaml_metadata(
            prompt=target_prompt,
            unit='unit-3',
            result=execution_result,
            agent_name='claude-sonnet-3.5'
        )
        
        # Load updated state
        updated_data = self.load_yaml_data(temp_yaml_file)
        updated_prompt1_metadata = self.get_prompt_metadata_execution(updated_data, 'test-prompt-1')
        updated_prompt2_metadata = self.get_prompt_metadata_execution(updated_data, 'test-prompt-2')
        updated_prompt3_metadata = self.get_prompt_metadata_execution(updated_data, 'test-prompt-3')
        
        # CRITICAL ASSERTIONS: Other prompts must be unchanged
        assert updated_prompt1_metadata == initial_prompt1_metadata, \
            "test-prompt-1 metadata.execution was modified when it shouldn't have been"
        
        assert updated_prompt3_metadata == initial_prompt3_metadata, \
            "test-prompt-3 metadata.execution was modified when it shouldn't have been"
        
        # Verify target prompt was updated correctly
        assert len(updated_prompt2_metadata['results']) == 3, \
            "test-prompt-2 should now have 3 results (2 original + 1 new)"
        
        # Check that original results are preserved
        original_results = updated_prompt2_metadata['results'][:2]
        for i, original_result in enumerate(initial_prompt2_metadata['results']):
            assert original_results[i]['unit'] == original_result['unit']
            assert original_results[i]['timestamp'] == original_result['timestamp']
            assert original_results[i]['duration'] == original_result['duration']
            assert original_results[i]['success'] == original_result['success']
            assert original_results[i]['output_preview'] == original_result['output_preview']
        
        # Check new result was added
        new_result = updated_prompt2_metadata['results'][2]
        assert new_result['unit'] == 'unit-3'
        assert new_result['success'] is True
        assert new_result['output_preview'] == 'New execution result for unit-3'[:500]
        assert new_result['duration'] == 250
        
        # Verify other metadata fields were updated  
        assert updated_prompt2_metadata['execution_status'] == 'partial'  # per-unit not complete
        assert updated_prompt2_metadata['last_execution'] is not None
        assert updated_prompt2_metadata['last_execution'] != initial_prompt2_metadata['last_execution']
    
    @pytest.mark.asyncio
    async def test_metadata_preservation_multiple_updates(self, execution_engine, temp_yaml_file):
        """
        Test that multiple sequential updates preserve metadata correctly.
        
        This tests the fix under more realistic conditions where multiple
        prompts are updated in sequence.
        """
        # Load initial state
        initial_data = self.load_yaml_data(temp_yaml_file)
        initial_prompt1_metadata = self.get_prompt_metadata_execution(initial_data, 'test-prompt-1')
        initial_prompt2_metadata = self.get_prompt_metadata_execution(initial_data, 'test-prompt-2')
        initial_prompt3_metadata = self.get_prompt_metadata_execution(initial_data, 'test-prompt-3')
        
        # Update prompt 1
        prompt1 = PromptConfig(
            id='test-prompt-1', prompt='Test', agent_id='claude',
            agent_role='general', agent_name='claude-sonnet-3.5',
            model='claude-3.5-sonnet', framework='anthropic', status='enabled',
            created='2025-01-01T09:00:00', last_execution=None, iterations=1,
            last_result=None, user_problem='Test', additional_context=None,
            execution_scope='single', metadata={'scope_type': 'single'}
        )
        
        result1 = AgentExecutionResult(
            success=True, output='Update 1', error=None, duration=100, limit_hit=False
        )
        
        await execution_engine._update_yaml_metadata(prompt1, None, result1, 'claude-sonnet-3.5')
        
        # Check that prompts 2 and 3 are unchanged after first update
        intermediate_data = self.load_yaml_data(temp_yaml_file)
        intermediate_prompt2_metadata = self.get_prompt_metadata_execution(intermediate_data, 'test-prompt-2')
        intermediate_prompt3_metadata = self.get_prompt_metadata_execution(intermediate_data, 'test-prompt-3')
        
        assert intermediate_prompt2_metadata == initial_prompt2_metadata
        assert intermediate_prompt3_metadata == initial_prompt3_metadata
        
        # Update prompt 3
        prompt3 = PromptConfig(
            id='test-prompt-3', prompt='Test', agent_id='claude',
            agent_role='general', agent_name='claude-sonnet-3.5', 
            model='claude-3.5-sonnet', framework='anthropic', status='enabled',
            created='2025-01-01T10:00:00', last_execution=None, iterations=1,
            last_result=None, user_problem='Test', additional_context=None,
            execution_scope='single', metadata={'scope_type': 'single'}
        )
        
        result3 = AgentExecutionResult(
            success=False, output='', error='Update 3 error', duration=60, limit_hit=False
        )
        
        await execution_engine._update_yaml_metadata(prompt3, None, result3, 'claude-sonnet-3.5')
        
        # Final verification: check all prompts
        final_data = self.load_yaml_data(temp_yaml_file)
        final_prompt1_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-1')
        final_prompt2_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-2')
        final_prompt3_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-3')
        
        # Prompt 2 should still be unchanged
        assert final_prompt2_metadata == initial_prompt2_metadata
        
        # Prompt 1 should have 2 results (1 original + 1 new)
        assert len(final_prompt1_metadata['results']) == 2
        
        # Prompt 3 should have 2 results (1 original + 1 new)
        assert len(final_prompt3_metadata['results']) == 2
        
        # Verify the new results are correct
        new_result1 = final_prompt1_metadata['results'][1]
        assert new_result1['success'] is True
        assert new_result1['output_preview'] == 'Update 1'
        
        new_result3 = final_prompt3_metadata['results'][1]
        assert new_result3['success'] is False
        assert new_result3['error_message'] == 'Update 3 error'
    
    @pytest.mark.asyncio
    async def test_metadata_creation_for_new_prompt(self, execution_engine, temp_yaml_file):
        """
        Test that creating metadata for a prompt without existing metadata
        doesn't affect other prompts.
        """
        # Add a new prompt without metadata.execution to test file
        data = self.load_yaml_data(temp_yaml_file)
        data['prompts'].append({
            'id': 'test-prompt-new',
            'short_name': 'New Test Prompt',
            'short_description': 'New test prompt without metadata',
            'prompt': 'Test prompt content new',
            'execution_scope': 'single',
            'agent_id': 'claude',
            'agent_name': 'claude-sonnet-3.5',
            'agent_role': 'general',
            'model': 'claude-3.5-sonnet',
            'framework': 'anthropic',
            'status': 'enabled',
            'metadata': {},  # No execution metadata initially
            'created': '2025-01-01T13:00:00',
            'last_execution': None,
            'iterations': 1,
            'last_result': None
        })
        
        # Write updated data
        with open(temp_yaml_file, 'w', encoding='utf-8') as file:
            yaml.dump(data, file, default_flow_style=False)
        
        # Capture initial state of existing prompts
        initial_prompt1_metadata = self.get_prompt_metadata_execution(data, 'test-prompt-1')
        initial_prompt2_metadata = self.get_prompt_metadata_execution(data, 'test-prompt-2')
        initial_prompt3_metadata = self.get_prompt_metadata_execution(data, 'test-prompt-3')
        
        # Update the new prompt
        new_prompt = PromptConfig(
            id='test-prompt-new', prompt='Test', agent_id='claude',
            agent_role='general', agent_name='claude-sonnet-3.5',
            model='claude-3.5-sonnet', framework='anthropic', status='enabled',
            created='2025-01-01T13:00:00', last_execution=None, iterations=1,
            last_result=None, user_problem='Test', additional_context=None,
            execution_scope='single', metadata={'scope_type': 'single'}
        )
        
        new_result = AgentExecutionResult(
            success=True, output='New prompt result', error=None, duration=150, limit_hit=False
        )
        
        await execution_engine._update_yaml_metadata(new_prompt, None, new_result, 'claude-sonnet-3.5')
        
        # Verify existing prompts are unchanged
        final_data = self.load_yaml_data(temp_yaml_file)
        final_prompt1_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-1')
        final_prompt2_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-2')
        final_prompt3_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-3')
        
        assert final_prompt1_metadata == initial_prompt1_metadata
        assert final_prompt2_metadata == initial_prompt2_metadata
        assert final_prompt3_metadata == initial_prompt3_metadata
        
        # Verify new prompt has correct metadata
        final_new_prompt_metadata = self.get_prompt_metadata_execution(final_data, 'test-prompt-new')
        assert final_new_prompt_metadata is not None
        assert len(final_new_prompt_metadata['results']) == 1
        assert final_new_prompt_metadata['results'][0]['success'] is True
        assert final_new_prompt_metadata['results'][0]['output_preview'] == 'New prompt result'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])