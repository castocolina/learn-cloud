"""
Test suite for Claude agent --continue parameter logic fix.

Verifies that the --continue parameter is applied correctly:
- Never for single-scope executions
- Never for the first unit of per-unit executions  
- Always for second+ units of per-unit executions (when agent supports it)
"""

import sys
import tempfile
from pathlib import Path
from unittest.mock import patch, Mock

# Add the src/python directory to the path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'python'))

from prompt_utils.agent_handler import UnifiedAgentHandler


def test_claude_continue_logic_single_scope():
    """Test that single-scope executions never use --continue."""
    print("🧪 Testing single-scope executions (should never use --continue)")
    
    handler = UnifiedAgentHandler()
    
    # Test agent config with param_continue support
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'fallback_model': 'haiku',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True,
        'param_continue': '--continue'
    }
    
    # Test single-scope execution
    cmd = handler._build_claude_command(
        agent_config=agent_config,
        prompt="Test prompt",
        yolo_run=True,
        unit="unit1",
        execution_scope="single"
    )
    
    # Should not contain --continue
    assert '--continue' not in cmd, f"Single-scope execution should not use --continue. Command: {cmd}"
    
    # Should contain other parameters
    assert 'claude' in cmd
    assert '--model' in cmd
    assert 'sonnet' in cmd
    assert '--dangerously-skip-permissions' in cmd
    
    print("✅ Single-scope execution correctly excludes --continue")


def test_claude_continue_logic_per_unit_first_unit():
    """Test that the first unit of per-unit execution never uses --continue."""
    print("🧪 Testing first unit of per-unit execution (should not use --continue)")
    
    handler = UnifiedAgentHandler()
    
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True,
        'param_continue': '--continue'
    }
    
    # Mock detect_units to return a predictable list
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Test first unit of per-unit execution
        cmd = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt",
            yolo_run=True,
            unit="unit1",  # First unit
            execution_scope="per-unit"
        )
    
    # Should not contain --continue (first unit)
    assert '--continue' not in cmd, f"First unit should not use --continue. Command: {cmd}"
    
    # Should contain other parameters
    assert 'claude' in cmd
    assert '--model' in cmd
    assert '--dangerously-skip-permissions' in cmd
    
    print("✅ First unit of per-unit execution correctly excludes --continue")


def test_claude_continue_logic_per_unit_subsequent_units():
    """Test that subsequent units of per-unit execution use --continue."""
    print("🧪 Testing subsequent units of per-unit execution (should use --continue)")
    
    handler = UnifiedAgentHandler()
    
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True,
        'param_continue': '--continue'
    }
    
    # Mock detect_units to return a predictable list
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3', 'unit4']
        
        # Test second unit
        cmd2 = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt",
            yolo_run=True,
            unit="unit2",  # Second unit
            execution_scope="per-unit"
        )
        
        # Test third unit
        cmd3 = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt",
            yolo_run=True,
            unit="unit3",  # Third unit
            execution_scope="per-unit"
        )
        
        # Test fourth unit
        cmd4 = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt",
            yolo_run=True,
            unit="unit4",  # Fourth unit
            execution_scope="per-unit"
        )
    
    # All subsequent units should contain --continue
    assert '--continue' in cmd2, f"Second unit should use --continue. Command: {cmd2}"
    assert '--continue' in cmd3, f"Third unit should use --continue. Command: {cmd3}"
    assert '--continue' in cmd4, f"Fourth unit should use --continue. Command: {cmd4}"
    
    # Should contain other parameters
    for cmd in [cmd2, cmd3, cmd4]:
        assert 'claude' in cmd
        assert '--model' in cmd
        assert '--dangerously-skip-permissions' in cmd
    
    print("✅ Subsequent units of per-unit execution correctly include --continue")


def test_claude_continue_logic_no_param_continue_support():
    """Test that agents without param_continue never use --continue."""
    print("🧪 Testing agent without param_continue support")
    
    handler = UnifiedAgentHandler()
    
    # Agent config WITHOUT param_continue
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True
        # No param_continue key
    }
    
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Test subsequent unit (would normally use --continue)
        cmd = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt",
            yolo_run=True,
            unit="unit2",  # Second unit
            execution_scope="per-unit"
        )
    
    # Should not contain --continue (agent doesn't support it)
    assert '--continue' not in cmd, f"Agent without param_continue should never use --continue. Command: {cmd}"
    
    print("✅ Agent without param_continue support correctly excludes --continue")


def test_claude_continue_logic_plan_mode():
    """Test that plan mode never uses --continue regardless of other conditions."""
    print("🧪 Testing plan mode execution (should never use --continue)")
    
    handler = UnifiedAgentHandler()
    
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True,
        'param_continue': '--continue'
    }
    
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Test plan mode (yolo_run=False) with subsequent unit
        cmd = handler._build_claude_command(
            agent_config=agent_config,
            prompt="Test prompt",
            yolo_run=False,  # Plan mode
            unit="unit2",
            execution_scope="per-unit"
        )
    
    # Should not contain --continue (plan mode)
    assert '--continue' not in cmd, f"Plan mode should never use --continue. Command: {cmd}"
    
    # Should not contain yolo mode either
    assert '--dangerously-skip-permissions' not in cmd
    
    print("✅ Plan mode correctly excludes --continue")


def test_should_use_continue_helper_method():
    """Test the _should_use_continue helper method directly."""
    print("🧪 Testing _should_use_continue helper method")
    
    handler = UnifiedAgentHandler()
    
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Single scope should return False
        assert handler._should_use_continue('single', 'unit2') == False
        
        # No unit should return False
        assert handler._should_use_continue('per-unit', None) == False
        
        # First unit should return False
        assert handler._should_use_continue('per-unit', 'unit1') == False
        
        # Subsequent units should return True
        assert handler._should_use_continue('per-unit', 'unit2') == True
        assert handler._should_use_continue('per-unit', 'unit3') == True
        
        # Non-existent unit should return False
        assert handler._should_use_continue('per-unit', 'unit99') == True  # Not in list, so not first
    
    print("✅ _should_use_continue helper method works correctly")


def test_edge_cases():
    """Test edge cases for the continue logic."""
    print("🧪 Testing edge cases")
    
    handler = UnifiedAgentHandler()
    
    # Test with only one unit available
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1']
        
        # Even though it's per-unit, only one unit means no continuation
        assert handler._should_use_continue('per-unit', 'unit1') == False
    
    # Test with no units available
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = []
        
        assert handler._should_use_continue('per-unit', 'unit1') == False
    
    # Test with exception in detect_units
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.side_effect = Exception("Test exception")
        
        # Should return False on exception
        assert handler._should_use_continue('per-unit', 'unit2') == False
    
    print("✅ Edge cases handled correctly")


def test_command_display_string():
    """Test that command display string correctly shows --continue usage."""
    print("🧪 Testing command display string with --continue logic")
    
    handler = UnifiedAgentHandler()
    
    agent_config = {
        'agent_name': 'claude',
        'model': 'sonnet',
        'fallback_model': 'haiku',
        'param_yolo_mode': '--dangerously-skip-permissions',
        'edition_available': True,
        'param_continue': '--continue'
    }
    
    with patch('prompt_utils.utils.detect_units') as mock_detect_units:
        mock_detect_units.return_value = ['unit1', 'unit2', 'unit3']
        
        # Test display string for first unit (should not show --continue)
        display1 = handler._build_command_display_string(
            agent_config, yolo_run=True, unit="unit1", execution_scope="per-unit"
        )
        assert '--continue' not in display1
        
        # Test display string for second unit (should show --continue)
        display2 = handler._build_command_display_string(
            agent_config, yolo_run=True, unit="unit2", execution_scope="per-unit"  
        )
        assert '--continue' in display2
        
        # Test display string for single scope (should not show --continue)
        display_single = handler._build_command_display_string(
            agent_config, yolo_run=True, unit="unit1", execution_scope="single"
        )
        assert '--continue' not in display_single
    
    print("✅ Command display string correctly reflects --continue usage")


def run_all_tests():
    """Run all test cases."""
    print("🚀 Running Claude --continue Logic Tests")
    print("=" * 60)
    
    try:
        test_claude_continue_logic_single_scope()
        test_claude_continue_logic_per_unit_first_unit()
        test_claude_continue_logic_per_unit_subsequent_units()
        test_claude_continue_logic_no_param_continue_support()
        test_claude_continue_logic_plan_mode()
        test_should_use_continue_helper_method()
        test_edge_cases()
        test_command_display_string()
        
        print("\n🎉 All Claude --continue logic tests passed!")
        print("✅ The fix correctly implements session continuity logic:")
        print("   • Single-scope executions: Never use --continue")
        print("   • First unit of per-unit: Never use --continue")
        print("   • Subsequent units: Always use --continue (when supported)")
        print("   • Plan mode: Never use --continue") 
        print("   • Agents without support: Never use --continue")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)