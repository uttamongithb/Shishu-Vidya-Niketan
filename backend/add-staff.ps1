# PowerShell script to add staff members

$API_URL = "http://localhost:5001/api"

# Login to get token
Write-Host "🔐 Logging in..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body (@{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json) -ContentType "application/json"

if ($loginResponse.success) {
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    exit 1
}

# Prepare headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get existing staff
Write-Host "`n🗑️  Checking for existing staff..." -ForegroundColor Cyan
try {
    $existingStaff = Invoke-RestMethod -Uri "$API_URL/staff" -Method Get
    if ($existingStaff.success -and $existingStaff.data.Count -gt 0) {
        Write-Host "Found $($existingStaff.data.Count) existing staff. Deleting..." -ForegroundColor Yellow
        foreach ($staff in $existingStaff.data) {
            try {
                Invoke-RestMethod -Uri "$API_URL/staff/$($staff._id)" -Method Delete -Headers $headers | Out-Null
                Write-Host "   ✓ Deleted: $($staff.name)" -ForegroundColor Gray
            } catch {
                Write-Host "   ✗ Failed to delete: $($staff.name)" -ForegroundColor Red
            }
        }
        Write-Host "✅ Cleared all existing staff" -ForegroundColor Green
    } else {
        Write-Host "No existing staff to clear" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Error checking staff: $_" -ForegroundColor Yellow
}

# Staff members data
$staffMembers = @(
    @{
        name = "Shikekar Chandra Agarwal"
        position = "Director"
        image = "https://drive.google.com/uc?export=view&id=11yehAGmXJ1f_vszqUoUcoxqUZieLM2UN"
        bio = "Dr. Shikekar Chandra Agarwal is the visionary Director of Shishu Vidya Niketan, dedicated to providing quality education and holistic development for all students."
        qualifications = "Ph.D in Education, M.Ed, B.Ed"
        experience = "25+ years in Educational Leadership"
        email = "director@shishuvidyaniketan.edu"
        phone = "+91 98765 43210"
        achievements = @(
            "Established Shishu Vidya Niketan with a vision for excellence",
            "Implemented modern teaching methodologies",
            "Built strong community partnerships for student welfare"
        )
    },
    @{
        name = "Aninda Kumar Das"
        position = "Principal"
        image = "https://drive.google.com/uc?export=view&id=1GLOGd1YcNaGNzkQ8bgQkdJa-idPpDCWL"
        bio = "Mr. Aninda Kumar Das brings extensive experience in academic leadership and is committed to maintaining high standards of education and student development."
        qualifications = "M.A., M.Ed, Ph.D (Pursuing)"
        experience = "20+ years in Teaching and Administration"
        email = "principal@shishuvidyaniketan.edu"
        phone = "+91 98765 43211"
        achievements = @(
            "Enhanced academic performance across all grades",
            "Introduced innovative teaching practices",
            "Strengthened student counseling and support systems"
        )
    },
    @{
        name = "Arjun Kumar Mandal"
        position = "Vice Principal"
        image = "https://drive.google.com/uc?export=view&id=1g1lasOh_SiijEx5_ml2071X1DGFGVcsH"
        bio = "Mr. Arjun Kumar Mandal oversees daily operations and ensures smooth functioning of all academic and administrative activities at the school."
        qualifications = "M.Sc, B.Ed"
        experience = "15+ years in Education"
        email = "viceprincipal@shishuvidyaniketan.edu"
        phone = "+91 98765 43213"
        achievements = @(
            "Streamlined administrative processes",
            "Implemented effective student discipline systems",
            "Enhanced parent-teacher communication"
        )
    }
)

# Add new staff members
Write-Host "`n📝 Adding new staff members...`n" -ForegroundColor Cyan

foreach ($staff in $staffMembers) {
    try {
        $body = $staff | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$API_URL/staff" -Method Post -Body $body -Headers $headers
        
        if ($response.success) {
            Write-Host "✅ Added: $($staff.name) ($($staff.position))" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Failed to add $($staff.name): $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Staff data update completed!`n" -ForegroundColor Green
Write-Host "📸 Image URLs:" -ForegroundColor Cyan
foreach ($staff in $staffMembers) {
    Write-Host "   $($staff.name): $($staff.image)" -ForegroundColor Gray
}
