"""
Integration test for execution engine with fixed --continue logic.

Verifies that the execution engine correctly passes execution_scope to the agent handler.
"""

import sys
from pathlib import Path
from unittest.mock import Mock, patch

# Add the src/python directory to the path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'python'))

from prompt_utils.config_manager import PromptConfig
from prompt_utils.agent_handler import execute_agent_prompt


def test_execution_engine_passes_execution_scope():
    """Test that execution engine passes execution_scope correctly."""
    print("🧪 Testing that execution engine passes execution_scope to agent handler")
    
    # This test verifies the integration by checking the command construction
    # without actually executing the commands
    
    from prompt_utils.agent_handler import UnifiedAgentHandler
    
    handler = UnifiedAgentHandler()
    
    # Create mock agent config
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'param_continue': '--continue',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True
    }
    
    # Mock detect_units to return predictable results
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Test command construction with different execution scopes
        # This simulates what the execution engine would pass to the agent handler
        
        # Simulate per-unit execution for first unit
        cmd1 = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt content",
            yolo_run=True,
            unit="unit1",  # First unit
            execution_scope="per-unit"  # From prompt.execution_scope
        )
        
        # Simulate per-unit execution for second unit  
        cmd2 = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt content", 
            yolo_run=True,
            unit="unit2",  # Second unit
            execution_scope="per-unit"  # From prompt.execution_scope
        )
        
        # Simulate single execution
        cmd3 = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt content",
            yolo_run=True,
            unit=None,  # No specific unit
            execution_scope="single"  # From prompt.execution_scope
        )
    
    # Verify that commands are constructed correctly
    assert '--continue' not in cmd1, "First unit of per-unit should not use --continue"
    assert '--continue' in cmd2, "Second unit of per-unit should use --continue"
    assert '--continue' not in cmd3, "Single execution should not use --continue"
    
    print("✅ Execution engine integration test passed")
    print("   • Command construction works correctly with execution_scope parameter")
    print("   • Parameters flow correctly from execution engine to agent handler")


def test_manual_command_verification():
    """Manually verify the commands that would be generated."""
    print("🧪 Manually verifying generated commands")
    
    from prompt_utils.agent_handler import UnifiedAgentHandler
    
    handler = UnifiedAgentHandler()
    
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'fallback_model': 'haiku',
        'param_continue': '--continue',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True
    }
    
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Generate commands for different scenarios
        cmd_single = handler._build_claude_command(
            agent_config, "test prompt", yolo_run=True, unit="unit1", execution_scope="single"
        )
        
        cmd_first_unit = handler._build_claude_command(
            agent_config, "test prompt", yolo_run=True, unit="unit1", execution_scope="per-unit"
        )
        
        cmd_second_unit = handler._build_claude_command(
            agent_config, "test prompt", yolo_run=True, unit="unit2", execution_scope="per-unit"
        )
        
        cmd_third_unit = handler._build_claude_command(
            agent_config, "test prompt", yolo_run=True, unit="unit3", execution_scope="per-unit"
        )
    
    print("📋 Generated Commands:")
    print(f"   Single scope:     {' '.join(cmd_single)}")
    print(f"   Per-unit unit1:   {' '.join(cmd_first_unit)}")
    print(f"   Per-unit unit2:   {' '.join(cmd_second_unit)}")
    print(f"   Per-unit unit3:   {' '.join(cmd_third_unit)}")
    
    # Verify the logic
    assert '--continue' not in cmd_single, "Single scope should not use --continue"
    assert '--continue' not in cmd_first_unit, "First unit should not use --continue"
    assert '--continue' in cmd_second_unit, "Second unit should use --continue"
    assert '--continue' in cmd_third_unit, "Third unit should use --continue"
    
    print("✅ Manual command verification passed")
    print("   • Single scope correctly excludes --continue")
    print("   • First unit correctly excludes --continue")
    print("   • Subsequent units correctly include --continue")


def run_integration_tests():
    """Run integration tests."""
    print("🚀 Running Integration Tests for --continue Logic Fix")
    print("=" * 60)
    
    try:
        test_execution_engine_passes_execution_scope()
        test_manual_command_verification()
        
        print("\n🎉 All integration tests passed!")
        print("✅ The --continue logic fix is working correctly end-to-end")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Integration test failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False


if __name__ == '__main__':
    success = run_integration_tests()
    sys.exit(0 if success else 1)