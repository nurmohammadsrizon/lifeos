import unittest

from auth import login_auth


class LoginAuthTests(unittest.TestCase):
    def test_valid_credentials_return_true(self):
        self.assertTrue(login_auth.checkUser("notsrizon@gmail.com", "srizon2009"))

    def test_invalid_credentials_return_false(self):
        self.assertFalse(login_auth.checkUser("notsrizon@gmail.com", "wrong-password"))


if __name__ == "__main__":
    unittest.main()
