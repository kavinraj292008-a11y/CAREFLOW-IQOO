"""
Pytest configuration for CareFlow backend tests.
Adds backend/ to sys.path so 'from app.xxx import yyy' works.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
