from pathlib import Path
from playwright.sync_api import sync_playwright, expect


BASE_URL = "http://localhost:3000"
ARTIFACTS = Path(__file__).parent / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    errors = []
    page.on("console", lambda message: errors.append(f"console: {message.text}") if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))

    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    expect(page.locator('.brand img').first).to_have_attribute('src', '/brand-logo-v2.png')
    assert 'hero-luxury-v3.webp' in page.locator('.hero').evaluate("el => getComputedStyle(el).backgroundImage")
    expect(page.locator('.property-primary').first).to_have_attribute('src', '/luxury/property-1-balcony.webp')

    page.get_by_label('Location').select_option(label='Son Tra')
    page.get_by_label('Budget').select_option('under')
    expect(page.locator('.results-row strong')).to_have_text('01')

    page.get_by_test_id('language-toggle').click()
    expect(page.get_by_role('heading', name='Tìm ngôi nhà bên bờ biển.')).to_be_visible()
    page.get_by_test_id('language-toggle').click()

    page.get_by_label('Location').select_option('all')
    page.get_by_label('Budget').select_option('all')
    page.get_by_role('button', name='⌖ Map').click()
    expect(page.locator('.property-map')).to_be_visible()
    page.locator('.map-pin').nth(1).click()
    expect(page.locator('.map-preview')).to_contain_text('The Han River Suite')
    page.get_by_role('button', name='▦ Grid').click()

    page.locator('.favorite-button').first.click()
    expect(page.get_by_test_id('saved-button').locator('b')).to_have_text('1')
    assert page.evaluate("localStorage.getItem('dnre-favorites')") == '[1]'

    page.locator('.quick-view-button').first.click()
    expect(page.locator('.property-modal')).to_be_visible()
    expect(page.locator('.property-modal .modal-close')).to_be_focused()
    expect(page.locator('.gallery-thumbs button')).to_have_count(3)
    first_image = page.locator('.modal-gallery > img').get_attribute('src')
    page.get_by_role('button', name='Next photo').click()
    expect(page.locator('.modal-gallery > img')).not_to_have_attribute('src', first_image)
    expect(page.locator('.modal-gallery > img')).to_have_attribute('src', '/luxury/property-1-bedroom.webp')
    page.get_by_role('button', name='Close').click()

    assert page.locator('.signature-rail button').count() >= 1
    page.locator('.signature-rail button').first.click()
    expect(page.locator('.signature-copy h2')).to_have_text('Oceanview Residence')

    page.get_by_test_id('saved-button').click()
    expect(page.get_by_role('heading', name='Your saved homes')).to_be_visible()
    page.locator('.saved-drawer > header button').click()

    page.get_by_role('button', name='Find a home', exact=True).click()
    expect(page.get_by_role('heading', name='Where would you like to live?')).to_be_visible()
    page.get_by_role('button', name='My Khe Beach').click()
    page.get_by_role('button', name='Continue →').click()
    page.get_by_role('button', name='Apartment').click()
    page.get_by_role('button', name='Continue →').click()
    page.get_by_role('button', name='Within one month').click()
    page.get_by_role('button', name='Continue →').click()
    expect(page.get_by_role('heading', name='Your shortlist brief is ready.')).to_be_visible()
    page.get_by_role('button', name='Close').click()

    page.screenshot(path=str(ARTIFACTS / 'desktop-interactive.png'), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto(BASE_URL)
    mobile.wait_for_load_state('networkidle')
    expect(mobile.get_by_role('button', name='Menu')).to_be_visible()
    mobile.get_by_role('button', name='Menu').click()
    expect(mobile.get_by_role('dialog', name='Menu')).to_be_visible()
    expect(mobile.get_by_role('button', name='Close menu')).to_be_focused()
    expect(mobile.get_by_role('link', name='01 Properties')).to_be_visible()
    mobile.screenshot(path=str(ARTIFACTS / 'mobile-menu.png'), full_page=True)

    assert not errors, "Browser errors: " + " | ".join(errors)
    mobile.close()
    context.close()
    browser.close()

print('interactive QA passed')
