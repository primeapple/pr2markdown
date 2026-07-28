import test from 'node:test';
import assert from 'node:assert/strict';
import userscript from '../pr2markdown.user.js';

const { generateMarkdown, getRepoShorthand } = userscript;

test('gets a GitHub repository shorthand', () => {
    assert.equal(
        getRepoShorthand('github', 'https://github.com/acme/widgets/pull/123'),
        'acme/widgets',
    );
});

test('gets a GitLab repository shorthand', () => {
    assert.equal(
        getRepoShorthand('gitlab', 'https://gitlab.com/gitlab-org/gitlab/-/merge_requests/150196'),
        'gitlab-org/gitlab',
    );
});

test('includes repository shorthand in the markdown label', () => {
    assert.equal(
        generateMarkdown(
            'Fix bug',
            'https://github.com/acme/widgets/pull/123',
            'acme/widgets',
        ),
        '[acme/widgets - Fix bug](https://github.com/acme/widgets/pull/123)',
    );
});

test('omits repository shorthand by default', () => {
    assert.equal(
        generateMarkdown('Fix bug', 'https://github.com/acme/widgets/pull/123'),
        '[Fix bug](https://github.com/acme/widgets/pull/123)',
    );
});
