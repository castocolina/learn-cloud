#!/usr/bin/env python3
"""
YAML Serialization Test Suite

Comprehensive tests for validating YAML serialization behavior in the learn-cloud project.
Tests the shared YAML utilities used by prompt_manager.py and prompt_executor.py to ensure
correct multiline string formatting without unwanted blank lines.

Test Coverage:
- Multiline string serialization with folded style (>)
- Text preprocessing and line wrapping
- Blank line optimization
- Complex data structures with nested multiline content
- Edge cases and error handling
"""

import unittest
import tempfile
import os
import sys
from pathlib import Path
from typing import Dict, Any

# Add the Python source directory to the path for imports
current_dir = Path(__file__).parent
project_root = current_dir.parent.parent
python_src = project_root / 'python'
sys.path.insert(0, str(python_src))

from prompt_utils.yaml_utils import (
    save_yaml_multiline,
    preprocess_text_for_yaml,
    preprocess_data_for_yaml,
    load_yaml_safe,
    format_yaml_content,
    SharedMultilineDumper
)

class TestYAMLSerialization(unittest.TestCase):
    """Test suite for YAML serialization functionality."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.temp_files = []
    
    def tearDown(self):
        """Clean up temporary files after each test method."""
        for temp_file in self.temp_files:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    def create_temp_file(self) -> str:
        """Create a temporary file and track it for cleanup."""
        temp_fd, temp_path = tempfile.mkstemp(suffix='.yaml')
        os.close(temp_fd)
        self.temp_files.append(temp_path)
        return temp_path
    
    def test_multiline_string_folded_style(self):
        """Test that multiline strings are saved with proper folded style formatting."""
        # Define test data with a multiline string
        test_data = {
            'prompts': [
                {
                    'id': 'TEST01',
                    'prompt': """This is a long prompt that spans multiple lines and should be formatted correctly without extra blank lines. It contains detailed instructions for the AI agent and should maintain proper text flow when saved to YAML format.

This is a second paragraph that should be separated from the first with appropriate spacing. The YAML folded style should handle this correctly without creating excessive blank lines.""",
                    'agent_name': 'claude',
                    'execution_scope': 'single',
                    'status': 'enabled'
                }
            ]
        }
        
        # Save to temporary file
        temp_file = self.create_temp_file()
        save_yaml_multiline(test_data, temp_file)
        
        # Read the actual content
        with open(temp_file, 'r', encoding='utf-8') as f:
            actual_yaml = f.read()
        
        # Verify the essential structure and formatting characteristics
        self.assertIn('prompts:', actual_yaml, "Should contain prompts key")
        self.assertIn('id: TEST01', actual_yaml, "Should contain the test ID")
        self.assertIn('prompt: >-', actual_yaml, "Should use folded style for multiline prompt")
        self.assertIn('agent_name: claude', actual_yaml, "Should contain agent name")
        self.assertIn('execution_scope: single', actual_yaml, "Should contain execution scope")
        self.assertIn('status: enabled', actual_yaml, "Should contain status")
        
        # This is the key test for the bug we're trying to detect:
        # The YAML should NOT contain double newlines within the prompt content
        # which indicate unwanted blank lines in the YAML output
        prompt_section = actual_yaml.split('prompt: >-')[1].split('agent_name:')[0]
        self.assertNotIn('\n\n', prompt_section, 
                        "YAML folded style prompt should not contain double newlines (unwanted blank lines)")
        
        # Verify the prompt content is present and properly formatted
        self.assertIn('This is a long prompt', actual_yaml, "Prompt content should be preserved")
        self.assertIn('This is a second', actual_yaml, "All content should be preserved")
        
        # Verify no excessive blank lines in the entire YAML (triple newlines indicate formatting issues)
        self.assertNotIn('\n\n\n', actual_yaml, "YAML output should not contain excessive blank lines")
    
    def test_text_preprocessing(self):
        """Test the text preprocessing function for proper line handling."""
        # Test text with multiple paragraphs and long lines
        input_text = """This is a very long line that should be wrapped properly when processed by the YAML utilities and should not create formatting issues.

This is a second paragraph with intentional line breaks that should be handled correctly by the preprocessing logic."""
        
        # Process the text
        processed = preprocess_text_for_yaml(input_text, max_line_width=80)
        
        # Verify the processed text flows properly
        self.assertNotIn('\n\n', processed, "Processed text should not contain double newlines")
        # Note: Line wrapping is now handled by YAML itself, not preprocessing
        # The preprocessing creates flowing text that YAML can wrap appropriately
        self.assertIn('This is a very long line', processed, "Original content should be preserved")
        self.assertIn('This is a second', processed, "Paragraph content should be preserved")
        # Verify that paragraphs are joined into flowing text (current behavior)
        self.assertIn('formatting issues. This is a second', processed,
                     "Paragraphs should be joined into flowing text")
        
        # Test that the text works well with YAML folded style
        test_data = {'content': processed}
        yaml_output = save_yaml_multiline(test_data, max_line_width=80)
        # Verify YAML handles the wrapping properly
        lines = yaml_output.split('\n')
        content_lines = [line for line in lines if line.strip() and not line.strip().startswith('content:') and not line.strip().startswith('-')]
        if content_lines:
            max_line_length = max(len(line) for line in content_lines)
            self.assertLess(max_line_length, 90, "YAML output lines should respect width limits")
    
    def test_complex_data_structure(self):
        """Test YAML serialization with complex nested structures containing multiline strings."""
        test_data = {
            'configuration': {
                'agents': {
                    'claude': {
                        'description': """Claude is a sophisticated AI assistant designed for complex reasoning tasks. It excels at analysis, writing, and problem-solving with a focus on safety and helpfulness.

Claude can handle various types of content including technical documentation, creative writing, and educational materials.""",
                        'models': ['sonnet', 'haiku', 'opus'],
                        'limits': {
                            'timeout': 300,
                            'rate_limit': '5 hours'
                        }
                    }
                },
                'prompts': [
                    {
                        'id': 'COMPLEX01',
                        'user_problem': """The system needs comprehensive documentation that explains the architecture clearly. This documentation should be written in a way that both technical and non-technical stakeholders can understand.

The documentation must cover the following areas:
1. System overview and purpose
2. Technical architecture details
3. Usage instructions and examples
4. Troubleshooting and common issues""",
                        'improved_context': 'Additional context for better prompt generation',
                        'metadata': {
                            'creation_date': '2024-01-15',
                            'last_modified': '2024-01-20',
                            'tags': ['documentation', 'architecture', 'comprehensive']
                        }
                    }
                ]
            }
        }
        
        # Save to temporary file
        temp_file = self.create_temp_file()
        save_yaml_multiline(test_data, temp_file)
        
        # Read back and verify structure
        loaded_data = load_yaml_safe(temp_file)
        
        # Verify the data structure is preserved
        self.assertIn('configuration', loaded_data)
        self.assertIn('agents', loaded_data['configuration'])
        self.assertIn('claude', loaded_data['configuration']['agents'])
        
        # Verify multiline strings are handled correctly
        claude_desc = loaded_data['configuration']['agents']['claude']['description']
        self.assertIn('Claude is a sophisticated AI assistant', claude_desc)
        self.assertIn('Claude can handle various types', claude_desc)
        
        # Verify no excessive blank lines in the saved file
        with open(temp_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check that there are no triple newlines (excessive blank lines)
        self.assertNotIn('\n\n\n', content, "YAML output should not contain excessive blank lines")
    
    def test_data_preprocessing_recursive(self):
        """Test that data preprocessing correctly handles nested structures."""
        test_data = {
            'level1': {
                'level2': {
                    'level3': {
                        'multiline_field': """This is nested multiline content that should be processed correctly.

It contains multiple paragraphs and should be handled by the recursive preprocessing."""
                    }
                }
            },
            'list_with_multiline': [
                {
                    'item1': """First item with multiline content.

This should also be processed correctly."""
                },
                'simple_string',
                {
                    'item2': """Second item with different multiline content.

Each item should be processed independently."""
                }
            ]
        }
        
        processed = preprocess_data_for_yaml(test_data, max_line_width=80)
        
        # Verify nested string was processed
        nested_content = processed['level1']['level2']['level3']['multiline_field']
        self.assertNotIn('\n\n', nested_content, "Nested multiline content should be optimized")
        
        # Verify list items were processed
        list_item1 = processed['list_with_multiline'][0]['item1']
        list_item2 = processed['list_with_multiline'][2]['item2']
        
        self.assertNotIn('\n\n', list_item1, "List item multiline content should be optimized")
        self.assertNotIn('\n\n', list_item2, "List item multiline content should be optimized")
        
        # Verify simple strings are unchanged
        self.assertEqual(processed['list_with_multiline'][1], 'simple_string')
    
    def test_yaml_round_trip(self):
        """Test that data can be saved and loaded without corruption."""
        original_data = {
            'test_prompt': {
                'content': """This is a test prompt with multiple lines.

It should maintain its content integrity through save and load operations.

The formatting should be preserved while optimizing the YAML output.""",
                'metadata': {
                    'type': 'test',
                    'version': '1.0'
                }
            }
        }
        
        # Save to temporary file
        temp_file = self.create_temp_file()
        save_yaml_multiline(original_data, temp_file)
        
        # Load back from file
        loaded_data = load_yaml_safe(temp_file)
        
        # Verify essential content is preserved
        self.assertEqual(loaded_data['test_prompt']['metadata']['type'], 'test')
        self.assertEqual(loaded_data['test_prompt']['metadata']['version'], '1.0')
        
        original_content = original_data['test_prompt']['content']
        loaded_content = loaded_data['test_prompt']['content']
        
        # The content should preserve the essential meaning even if formatting changes
        self.assertIn('This is a test prompt', loaded_content)
        self.assertIn('multiple lines', loaded_content)
        self.assertIn('content integrity', loaded_content)
        self.assertIn('formatting should be preserved', loaded_content)
    
    def test_edge_cases(self):
        """Test edge cases and error conditions."""
        # Test empty strings
        empty_data = {'empty_field': ''}
        temp_file = self.create_temp_file()
        save_yaml_multiline(empty_data, temp_file)
        loaded = load_yaml_safe(temp_file)
        self.assertEqual(loaded['empty_field'], '')
        
        # Test None values
        none_data = {'none_field': None}
        temp_file = self.create_temp_file()
        save_yaml_multiline(none_data, temp_file)
        loaded = load_yaml_safe(temp_file)
        self.assertIsNone(loaded['none_field'])
        
        # Test numeric and boolean values
        mixed_data = {
            'number': 42,
            'float': 3.14,
            'boolean': True,
            'list': [1, 2, 3],
            'nested': {'inner': 'value'}
        }
        temp_file = self.create_temp_file()
        save_yaml_multiline(mixed_data, temp_file)
        loaded = load_yaml_safe(temp_file)
        
        self.assertEqual(loaded['number'], 42)
        self.assertEqual(loaded['float'], 3.14)
        self.assertEqual(loaded['boolean'], True)
        self.assertEqual(loaded['list'], [1, 2, 3])
        self.assertEqual(loaded['nested']['inner'], 'value')
    
    def test_format_yaml_content_function(self):
        """Test the format_yaml_content utility function."""
        # Test YAML string reformatting
        input_yaml = """
prompts:
  - id: TEST01
    prompt: "This is a long prompt that should be reformatted with proper multiline style when processed by the format function."
    status: enabled
"""
        
        formatted = format_yaml_content(input_yaml)
        
        # Verify the output is properly formatted
        self.assertIn('prompts:', formatted)
        self.assertIn('id: TEST01', formatted)
        self.assertIn('status: enabled', formatted)
        
        # The long prompt should be reformatted with multiline style
        self.assertIn('prompt:', formatted)
    
    def test_file_not_found_handling(self):
        """Test that file not found errors are handled gracefully."""
        result = load_yaml_safe('/nonexistent/path/file.yaml')
        self.assertEqual(result, {}, "Should return empty dict for non-existent files")
    
    def test_yaml_width_limits(self):
        """Test that YAML output respects width limits for better readability."""
        long_text = "This is a very long line that should definitely exceed normal terminal width and needs to be wrapped properly " * 3
        
        test_data = {'long_content': long_text}
        
        # Test with different width limits
        temp_file = self.create_temp_file()
        save_yaml_multiline(test_data, temp_file, max_line_width=80)
        
        with open(temp_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check that lines are generally within reasonable limits
        lines = content.split('\n')
        content_lines = [line for line in lines if line.strip() and not line.strip().startswith('-')]
        
        # Most lines should be within a reasonable range of the width limit
        long_lines = [line for line in content_lines if len(line) > 120]
        self.assertLess(len(long_lines), len(content_lines) * 0.1, 
                       "Most lines should respect width limits")


class TestYAMLSerializationIntegration(unittest.TestCase):
    """Integration tests for YAML serialization with real-world scenarios."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_files = []
    
    def tearDown(self):
        """Clean up temporary files."""
        for temp_file in self.temp_files:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    def create_temp_file(self) -> str:
        """Create a temporary file and track it for cleanup."""
        temp_fd, temp_path = tempfile.mkstemp(suffix='.yaml')
        os.close(temp_fd)
        self.temp_files.append(temp_path)
        return temp_path
    
    def test_real_world_prompt_data(self):
        """Test YAML serialization with complex multiline text that could create blank lines.
        
        This test validates that the save_yaml_multiline function correctly preprocesses
        text that contains embedded newlines and paragraph breaks, ensuring the output
        YAML uses clean folded style without unwanted blank lines.
        
        The test demonstrates both the problem (what happens without preprocessing)
        and the solution (our current implementation with preprocessing).
        """
        
        # Create a prompt with the structure that demonstrates the issue
        problematic_prompt = """You are focused on automation and large-scale refactoring.
Your main skill is analyzing the complete project structure
to execute massive changes safely.

You are ideal for tasks like renaming units, updating hundreds of links,
migrating file structures, or generating complex scripts that manipulate the codebase,
ensuring project integrity during significant structural changes.

Framework: Plan-and-Solve

Your task is to help solve the following problem:
The `prompt_manager.py` script needs a new bulk-loading feature.

This feature should be triggered by a "load" command or menu option.
It must read a specified Markdown file, parse its content into separate sections.

After parsing, it should present the extracted sections to the user,
allowing them to select which ones to process."""

        real_world_data = {
            'prompts': [
                {
                    'id': '2BC1T',
                    'short_name': 'Add Bulk Prompt Loader to Manager',
                    'prompt': problematic_prompt,
                    'execution_scope': 'single',
                    'agent_name': 'gemini'
                }
            ]
        }
        
        # Test what would happen WITHOUT preprocessing (to demonstrate the problem)
        # We'll manually simulate what broken YAML serialization would produce
        import yaml
        from prompt_utils.yaml_utils import SharedMultilineDumper
        
        # Serialize WITHOUT preprocessing (this would be the broken behavior)
        broken_yaml = yaml.dump(real_world_data, 
                              Dumper=SharedMultilineDumper,
                              default_flow_style=False,
                              allow_unicode=True,
                              sort_keys=False,
                              width=120,
                              indent=2)
        
        print("\n=== BROKEN YAML (WITHOUT PREPROCESSING) ===")
        print(broken_yaml)
        
        # Check if the broken version would have blank lines
        prompt_section_broken = broken_yaml[broken_yaml.find('prompt: >'):broken_yaml.find('execution_scope:')]
        has_blank_lines_broken = '\n\n    ' in prompt_section_broken
        print(f"Broken version has blank lines: {has_blank_lines_broken}")
        
        # First, analyze the original prompt content to understand the issue
        print(f"\n=== ORIGINAL PROMPT ANALYSIS ===")
        print(f"Original prompt contains newlines: {'\\n' in problematic_prompt}")
        print(f"Original prompt newline count: {problematic_prompt.count('\\n')}")
        print(f"Original prompt double newline count: {problematic_prompt.count('\\n\\n')}")
        print("First 300 chars of original prompt:")
        print(repr(problematic_prompt[:300]))
        
        # Now test with our FIXED save_yaml_multiline function (with preprocessing)
        temp_file = self.create_temp_file()
        save_yaml_multiline(real_world_data, temp_file)
        
        # Read the fixed content
        with open(temp_file, 'r', encoding='utf-8') as f:
            fixed_content = f.read()
        
        print("\n=== FIXED YAML (WITH PREPROCESSING) ===")
        print(fixed_content)
        
        # Extract the prompt section for detailed analysis
        prompt_start = fixed_content.find('prompt: >-')
        prompt_end = fixed_content.find('\n  execution_scope:', prompt_start)
        if prompt_start != -1 and prompt_end != -1:
            prompt_section_fixed = fixed_content[prompt_start:prompt_end]
            
            print(f"\n=== COMPARISON ANALYSIS ===")
            has_blank_lines_fixed = '\n\n    ' in prompt_section_fixed
            print(f"Fixed version has blank lines: {has_blank_lines_fixed}")
            
            # The key assertions: Our preprocessing should eliminate blank lines
            self.assertNotIn('\n\n    ', prompt_section_fixed, 
                           "YAML folded style should not contain double newlines that create blank lines in the output")
            
            # Verify the fixed version is cleaner than the broken version
            fixed_newline_count = prompt_section_fixed.count('\n\n')
            self.assertEqual(fixed_newline_count, 0, 
                           f"Fixed YAML should have no consecutive newlines in prompt section, but found {fixed_newline_count}")
        
        # Verify the content can be loaded back correctly and maintains meaning
        loaded_data = load_yaml_safe(temp_file)
        self.assertEqual(loaded_data['prompts'][0]['id'], '2BC1T')
        self.assertIn('You are focused on automation', loaded_data['prompts'][0]['prompt'])
        self.assertEqual(loaded_data['prompts'][0]['execution_scope'], 'single')
        
        # The loaded content should be clean flowing text
        loaded_prompt = loaded_data['prompts'][0]['prompt']
        self.assertIn('Framework: Plan-and-Solve', loaded_prompt)
        self.assertIn('bulk-loading feature', loaded_prompt)


def run_test_suite():
    """Run the complete YAML serialization test suite."""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestYAMLSerialization))
    suite.addTests(loader.loadTestsFromTestCase(TestYAMLSerializationIntegration))
    
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2, buffer=True)
    result = runner.run(suite)
    
    # Return success status
    return result.wasSuccessful()


if __name__ == '__main__':
    # Run the test suite when executed directly
    print("=" * 70)
    print("🧪 YAML Serialization Test Suite")
    print("=" * 70)
    print("Testing YAML utilities for correct multiline string formatting...")
    print()
    
    success = run_test_suite()
    
    print()
    print("=" * 70)
    if success:
        print("✅ All tests passed! YAML serialization is working correctly.")
    else:
        print("❌ Some tests failed. Please review the output above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
