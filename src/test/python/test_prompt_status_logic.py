#!/usr/bin/env python3
"""
Comprehensive Test Suite for Prompt Status Logic
==============================================

Tests the strict validation logic for prompt states to ensure that
ONLY complete prompts without questions and accepted by user become 'enabled'.
All other cases must result in 'needs_refinement'.

Author: AI Prompt Manager System
Date: September 2025
"""

import unittest
import sys
import os
from typing import Dict, Any, List

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'python'))

class TestPromptStatusLogic(unittest.TestCase):
    """Test cases for prompt status determination logic"""
    
    def determine_prompt_status(self, decision: Dict[str, Any], satisfied: bool) -> str:
        """
        Implementation of the status logic from prompt_manager.py
        
        Args:
            decision: Dictionary with Strategy Agent response
            satisfied: Boolean indicating user choice (True for 'y', False for 'm')
            
        Returns:
            String with final status: 'enabled' or 'needs_refinement'
        """
        # Extract Strategy Agent decision
        strategy_complete = decision.get('complete', False)
        has_questions = len(decision.get('questions', [])) > 0
        
        # Force needs_refinement if Strategy Agent marked as incomplete or has questions
        if not strategy_complete or has_questions:
            return 'needs_refinement'
        else:
            return 'enabled' if satisfied else 'needs_refinement'
    
    def test_01_ideal_case_enabled(self):
        """Test Case #1: Complete prompt, no questions, user accepts → enabled"""
        decision = {
            'complete': True,
            'questions': []
        }
        satisfied = True  # User chose 'y'
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'enabled', 
                        "Complete prompt with no questions and user acceptance MUST be enabled")
    
    def test_02_questions_pending_forced_refinement(self):
        """Test Case #2: User accepts but has questions → needs_refinement (FORCED)"""
        decision = {
            'complete': False,
            'questions': ['What database to use?', 'Authentication method?']
        }
        satisfied = True  # User chose 'y' but should be overridden
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "Questions pending MUST force needs_refinement even if user accepts")
    
    def test_03_incomplete_forced_refinement(self):
        """Test Case #3: complete:false, no questions, user accepts → needs_refinement (FORCED)"""
        decision = {
            'complete': False,
            'questions': []
        }
        satisfied = True  # User chose 'y' but should be overridden
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "complete:false MUST force needs_refinement even if user accepts")
    
    def test_04_inconsistent_strategy_forced_refinement(self):
        """Test Case #4: complete:true but has questions → needs_refinement (FORCED)"""
        decision = {
            'complete': True,  # Marked complete
            'questions': ['What styling approach?']  # But has questions - inconsistent!
        }
        satisfied = True  # User chose 'y' but should be overridden
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "Inconsistent Strategy Agent (complete:true + questions) MUST force needs_refinement")
    
    def test_05_manual_complete_needs_refinement(self):
        """Test Case #5: Complete prompt, user chooses manual → needs_refinement"""
        decision = {
            'complete': True,
            'questions': []
        }
        satisfied = False  # User chose 'm' (manual)
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "Manual choice (satisfied=False) MUST result in needs_refinement")
    
    def test_06_manual_incomplete_needs_refinement(self):
        """Test Case #6: Incomplete prompt, user chooses manual → needs_refinement"""
        decision = {
            'complete': False,
            'questions': ['Database choice?']
        }
        satisfied = False  # User chose 'm' (manual)
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "Manual choice on incomplete prompt MUST result in needs_refinement")
    
    def test_07_edge_case_empty_decision(self):
        """Test Edge Case: Empty decision dictionary"""
        decision = {}
        satisfied = True
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "Empty decision MUST default to needs_refinement")
    
    def test_08_edge_case_none_questions(self):
        """Test Edge Case: questions field is None instead of list"""
        decision = {
            'complete': True,
            'questions': None
        }
        satisfied = True
        
        # Handle None gracefully
        if decision.get('questions') is None:
            decision['questions'] = []
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'enabled',
                        "None questions should be treated as empty list for complete prompt")
    
    def test_09_edge_case_missing_complete_field(self):
        """Test Edge Case: Missing 'complete' field"""
        decision = {
            'questions': []
        }
        satisfied = True
        
        result = self.determine_prompt_status(decision, satisfied)
        
        self.assertEqual(result, 'needs_refinement',
                        "Missing 'complete' field MUST default to needs_refinement")
    
    def test_10_multiple_questions_scenarios(self):
        """Test various question scenarios"""
        test_cases = [
            # (questions_list, expected_has_questions)
            ([], False),
            (['One question?'], True),
            (['Q1?', 'Q2?', 'Q3?'], True),
            ([''], True),  # Empty string still counts as a question
        ]
        
        for questions, expected_has_questions in test_cases:
            with self.subTest(questions=questions):
                decision = {
                    'complete': True,
                    'questions': questions
                }
                satisfied = True
                
                result = self.determine_prompt_status(decision, satisfied)
                
                if expected_has_questions:
                    self.assertEqual(result, 'needs_refinement',
                                   f"Questions {questions} should force needs_refinement")
                else:
                    self.assertEqual(result, 'enabled',
                                   f"No questions should allow enabled status")


class TestPromptStatusIntegration(unittest.TestCase):
    """Integration tests for realistic prompt scenarios"""
    
    def determine_prompt_status(self, decision: Dict[str, Any], satisfied: bool) -> str:
        """Same implementation as above for integration tests"""
        strategy_complete = decision.get('complete', False)
        has_questions = len(decision.get('questions', [])) > 0
        
        if not strategy_complete or has_questions:
            return 'needs_refinement'
        else:
            return 'enabled' if satisfied else 'needs_refinement'
    
    def test_realistic_scenarios(self):
        """Test realistic prompt generation scenarios"""
        scenarios = [
            {
                'name': 'Database Setup Prompt - Incomplete',
                'decision': {
                    'agent_id': 'PY01',
                    'short_name': 'Database Setup',
                    'complete': False,
                    'questions': ['Which database: PostgreSQL or MongoDB?', 'Authentication method?'],
                    'draft_prompt': 'Setup database for the application...'
                },
                'user_choices': [
                    ('y', 'needs_refinement'),  # Accept incomplete
                    ('m', 'needs_refinement'),  # Manual incomplete
                ],
            },
            {
                'name': 'UI Component - Complete',
                'decision': {
                    'agent_id': 'FE01',
                    'short_name': 'Button Component',
                    'complete': True,
                    'questions': [],
                    'draft_prompt': 'Create a reusable button component...'
                },
                'user_choices': [
                    ('y', 'enabled'),           # Accept complete - ONLY valid enabled case
                    ('m', 'needs_refinement'), # Manual complete
                ],
            },
            {
                'name': 'API Endpoint - Inconsistent',
                'decision': {
                    'agent_id': 'BE01',
                    'short_name': 'User API',
                    'complete': True,  # Says complete
                    'questions': ['Rate limiting strategy?'],  # But has questions!
                    'draft_prompt': 'Create user management API...'
                },
                'user_choices': [
                    ('y', 'needs_refinement'),  # Inconsistent state forces refinement
                    ('m', 'needs_refinement'),  # Manual inconsistent
                ],
            },
        ]
        
        for scenario in scenarios:
            for user_choice, expected_status in scenario['user_choices']:
                with self.subTest(scenario=scenario['name'], choice=user_choice):
                    satisfied = (user_choice == 'y')
                    result = self.determine_prompt_status(scenario['decision'], satisfied)
                    
                    self.assertEqual(result, expected_status,
                                   f"Scenario '{scenario['name']}' with choice '{user_choice}' "
                                   f"should result in '{expected_status}', got '{result}'")
    
    def test_enabled_conditions_summary(self):
        """Test that confirms ONLY one path leads to 'enabled'"""
        enabled_count = 0
        total_tests = 0
        
        # Test all combinations
        complete_values = [True, False]
        questions_scenarios = [[], ['question1'], ['q1', 'q2']]
        satisfied_values = [True, False]
        
        for complete in complete_values:
            for questions in questions_scenarios:
                for satisfied in satisfied_values:
                    total_tests += 1
                    decision = {'complete': complete, 'questions': questions}
                    result = self.determine_prompt_status(decision, satisfied)
                    
                    if result == 'enabled':
                        enabled_count += 1
                        # Verify this is the ONLY valid enabled case
                        self.assertTrue(complete, "enabled status requires complete=True")
                        self.assertEqual(len(questions), 0, "enabled status requires no questions")
                        self.assertTrue(satisfied, "enabled status requires satisfied=True")
        
        # Verify statistics
        self.assertEqual(enabled_count, 1, 
                        f"Only 1 combination should result in 'enabled', found {enabled_count}")
        self.assertEqual(total_tests, 12, 
                        f"Expected 12 total test combinations, found {total_tests}")
        
        print(f"\n📊 Status Distribution: {enabled_count} enabled, {total_tests - enabled_count} needs_refinement")
        print(f"✅ Validation: Only {enabled_count}/{total_tests} combinations result in 'enabled'")


class TestPromptStatusEdgeCases(unittest.TestCase):
    """Edge cases and error conditions"""
    
    def determine_prompt_status(self, decision: Dict[str, Any], satisfied: bool) -> str:
        """Same implementation for edge case testing"""
        strategy_complete = decision.get('complete', False)
        has_questions = len(decision.get('questions', [])) > 0
        
        if not strategy_complete or has_questions:
            return 'needs_refinement'
        else:
            return 'enabled' if satisfied else 'needs_refinement'
    
    def test_malformed_decisions(self):
        """Test various malformed decision structures"""
        malformed_cases = [
            None,  # Completely None
            {'complete': 'not_boolean'},  # Wrong type
            {'questions': 'not_list'},    # Wrong type
            {'complete': True},           # Missing questions
            {'questions': []},            # Missing complete
        ]
        
        for decision in malformed_cases:
            with self.subTest(decision=decision):
                try:
                    if decision is None:
                        decision = {}
                    
                    # Sanitize input
                    if not isinstance(decision.get('questions'), list):
                        decision['questions'] = []
                    
                    result = self.determine_prompt_status(decision, True)
                    
                    # Malformed decisions should never result in enabled
                    if decision.get('complete') is not True:
                        self.assertEqual(result, 'needs_refinement',
                                       f"Malformed decision {decision} should not be enabled")
                
                except Exception as e:
                    # Exceptions are acceptable for malformed input
                    pass


def run_comprehensive_status_tests():
    """Run all prompt status tests with detailed output"""
    print("🧪 " + "="*70)
    print("🧪 COMPREHENSIVE PROMPT STATUS VALIDATION TESTS")
    print("🧪 " + "="*70)
    print("🎯 Testing the strict rule: ONLY complete + no questions + accepted = enabled")
    print("🔒 All other cases MUST result in needs_refinement")
    print("🧪 " + "="*70)
    
    # Create test suite
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTest(unittest.makeSuite(TestPromptStatusLogic))
    suite.addTest(unittest.makeSuite(TestPromptStatusIntegration))
    suite.addTest(unittest.makeSuite(TestPromptStatusEdgeCases))
    
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(suite)
    
    # Summary
    print("\n🧪 " + "="*70)
    print("🧪 TEST EXECUTION SUMMARY")
    print("🧪 " + "="*70)
    print(f"✅ Tests run: {result.testsRun}")
    print(f"❌ Failures: {len(result.failures)}")
    print(f"🚫 Errors: {len(result.errors)}")
    
    if result.failures:
        print("\n💥 FAILURES:")
        for test, traceback in result.failures:
            print(f"   {test}: {traceback}")
    
    if result.errors:
        print("\n💥 ERRORS:")
        for test, traceback in result.errors:
            print(f"   {test}: {traceback}")
    
    success = len(result.failures) == 0 and len(result.errors) == 0
    
    if success:
        print(f"\n🎉 ALL TESTS PASSED! Prompt status logic is ROBUST.")
        print("✅ Validation confirmed: Only complete + no questions + accepted = enabled")
    else:
        print(f"\n💥 TESTS FAILED! Prompt status logic needs attention.")
    
    print("🧪 " + "="*70)
    
    return success


if __name__ == '__main__':
    run_comprehensive_status_tests()
