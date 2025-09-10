# Test Suite Documentation

This directory contains comprehensive test suites for the learn-cloud project, focusing on quality assurance for web applications, YAML serialization, and content validation.

## Test Structure

### `test_yaml_serialization.py`
Comprehensive test suite for YAML serialization functionality used by `prompt_manager.py` and `prompt_executor.py`.

**Test Coverage:**
- Multiline string serialization with folded style (`>`)
- Text preprocessing and line wrapping
- Blank line optimization validation
- Complex data structures with nested multiline content
- Edge cases and error handling
- Real-world prompt data scenarios

**Key Tests:**
- `test_multiline_string_folded_style()`: Validates that YAML output doesn't contain unwanted blank lines
- `test_text_preprocessing()`: Ensures proper text flow and paragraph joining
- `test_complex_data_structure()`: Tests nested structures with multiline content
- `test_yaml_round_trip()`: Verifies data integrity through save/load cycles

## Running Tests

### Individual Test Files
```bash
# Run YAML serialization tests
python src/test/test_yaml_serialization.py
```

### Using Python unittest
```bash
# Run specific test class
python -m unittest src.test.test_yaml_serialization.TestYAMLSerialization

# Run specific test method
python -m unittest src.test.test_yaml_serialization.TestYAMLSerialization.test_multiline_string_folded_style
```

## Test Philosophy

Following **Test-Driven Development (TDD)** principles:

1. **Red**: Write tests that fail initially (detecting issues)
2. **Green**: Implement fixes to make tests pass
3. **Refactor**: Improve code while maintaining test coverage

## Current Status

- ✅ YAML test suite created and validates formatting issues
- 🔍 Currently detecting blank line issues in YAML output (as expected)
- 📋 Test identifies the specific problem in `yaml_utils.py` serialization logic

## Adding New Tests

When adding new test files:

1. Place them in the `src/test/` directory
2. Follow the naming convention: `test_[component].py`
3. Include comprehensive docstrings explaining test purpose
4. Ensure proper cleanup of temporary files
5. Use descriptive assertion messages
6. Follow the established test structure patterns

## Dependencies

Tests use Python standard library modules:
- `unittest` - Test framework
- `tempfile` - Temporary file handling
- `os` - File system operations
- `sys` - Path manipulation

No external testing frameworks are required, ensuring tests can run in any Python environment.
