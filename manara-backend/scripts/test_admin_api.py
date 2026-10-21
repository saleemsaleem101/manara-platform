import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manara_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.models import User
from admin_panel.views import UserListView, CompanyListAdminView, DashboardStatsView

def test_api():
    print("Testing Admin API endpoints directly...")
    factory = APIRequestFactory()
    admin_user = User.objects.get(email='admin@manarah.ye')

    # Test 1: Users List Endpoint
    req1 = factory.get('/api/admin/users/')
    force_authenticate(req1, user=admin_user)
    view1 = UserListView.as_view()
    res1 = view1(req1)
    assert res1.status_code == 200, f"Users API returned {res1.status_code}"
    results = res1.data.get('results', res1.data) if isinstance(res1.data, dict) else res1.data
    total_count = res1.data.get('count', len(results)) if isinstance(res1.data, dict) else len(results)
    print(f"✓ GET /api/admin/users/ -> Status {res1.status_code}, Returned {len(results)} users on page (Total Count: {total_count})")

    # Test 2: Company Verification Approvals Endpoint
    req2 = factory.get('/api/admin/companies/')
    force_authenticate(req2, user=admin_user)
    view2 = CompanyListAdminView.as_view()
    res2 = view2(req2)
    assert res2.status_code == 200, f"Companies API returned {res2.status_code}"
    comp_results = res2.data.get('results', res2.data) if isinstance(res2.data, dict) else res2.data
    print(f"✓ GET /api/admin/companies/ -> Status {res2.status_code}, Found {len(comp_results)} registered companies")

    # Test 3: Dashboard Stats Endpoint
    req3 = factory.get('/api/admin/dashboard/')
    force_authenticate(req3, user=admin_user)
    view3 = DashboardStatsView.as_view()
    res3 = view3(req3)
    assert res3.status_code == 200, f"Dashboard API returned {res3.status_code}"
    print(f"✓ GET /api/admin/dashboard/ -> Status {res3.status_code}, KPIs: {res3.data}")

    print("\n✅ All Admin API Endpoints Verified Successfully! Data is properly stored and seen by Admin.")

if __name__ == '__main__':
    test_api()
