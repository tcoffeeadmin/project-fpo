// Components
import {PageNav} from './components/page-nav';
import {previousPageButton} from './components/prev-page';
import {podHeightMatch} from './components/content-pod-height-match';

// Modules
import settings from './modules/settings';
import session from './modules/session';
import form     from './modules/form';
import navigation from './modules/navigation';
import util from './modules/util';
import result from './modules/result';

// Init Components
var _pageNav = new PageNav().init();
var _previousPageButton = new previousPageButton().init();
var _podHeightMatch = new podHeightMatch().init();

// Init Modules
navigation.init();
session.init();
form.init();
util.init();
result.init();