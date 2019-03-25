/**
 * takes a SlsIsomorphic Component and parses it into an Iso-Config
 *
 * @param component a SlsIsomorphic React-Component
 */
import {ConfigTypes} from "./lib/config";
import {promisify} from "./libs";
import React from 'react'

const isClientApp = (component) => {

    return component.props &&
        component.props.id !== undefined &&
        component.props.path !== undefined &&
        component.props.method !== undefined ? true : false;
};

const isMiddleware = (component) => {

    return component.props &&
        component.props.callback !== undefined ? true : false;
};

const isRedirect = (component) => {

    return component.props &&
        component.props.from !== undefined &&
        component.props.to !== undefined &&
        component.props.status !== undefined ? true : false;
};

const isRoute = (component) => {

    return component.props &&
        component.props.path !== undefined &&
        component.props.render !== undefined &&
        component.props.name !== undefined ? true : false;
};

export const parseCustomComponent = (component, compileMode) => {

    try {

        //console.log("parseCustomComponent: " , component);


        const params = Object.assign({
            infrastructureMode: compileMode ? "compile" : undefined,
        }, component.props);

        var custom = undefined;
        const parsed = `const f=${component.type}; f(${JSON.stringify(params)})`;

        const result = eval(parsed);

        //console.log("isCustomComponent: ", component)
        //console.log("parsed: ", parsed);
        //console.log("result: ", result);

        return result.infrastructureType !== undefined ? result : undefined;

    } catch (error) {
        //console.error(error);
        return undefined;
    }


}

export const getChildrenArray = (component) => {
    return Array.isArray(component.props.children) ? component.props.children : [component.props.children];
};

const applyMiddleware = (mwComponent) => {
    return mwComponent.props.callback;
};


const parseMiddlewares = (component) => {
    return getChildrenArray(component)
        .filter(child => isMiddleware(child))
        .map(child => applyMiddleware(child));
}

const applyClientApp = (caComponent) => {

    console.log("applyClientApp: " , caComponent);

    return Object.assign(
        Object.assign({}, caComponent.props),
        {
            middlewareCallbacks: (caComponent.props.middlewareCallbacks !== undefined ?
                caComponent.props.middlewareCallbacks : []).concat(parseMiddlewares(caComponent)),

            redirects: (caComponent.props.redirects !== undefined ?
                caComponent.props.redirects : []).concat(parseRedirects(caComponent)),

            routes: (caComponent.props.routes !== undefined ?
                caComponent.props.routes : []).concat(parseRoutes(caComponent)),
        }
    );

};


export const applyCustomComponents = (component: any, addToTopLevelConfig, compileMode) => {
    //getChildrenArray(caComponent).forEach( c => {
        const customComponent = parseCustomComponent(component, compileMode);


        if (customComponent !== undefined && compileMode) {
            console.log("CustomComponent: ", customComponent);

            // now add to the configuration
            addToTopLevelConfig(customComponent);

            // we expect a single one child!!
            if (Array.isArray(customComponent.children)) {
                throw new Error("custom Component must have a single one child!");
            }
            //console.log("component: " , component);
            return component.props.children

        } else if (customComponent !== undefined) {
            //console.log("applyCustomComponents | customComponent ")

            if (React.isValidElement(component)) {
                console.log("custom component is a react-component, " , component)
                if (Array.isArray(customComponent.children)) {
                    throw new Error("custom Component must have a single one child!");
                }

                const child = component["props"]["children"];
                
                var customProps = {}
                customProps[customComponent.infrastructureType] = React.cloneElement(component, Object.assign({}, component.props, {infrastructureMode: "component"}))

                console.log("customProps: " , customProps);
                
                return React.cloneElement(component, Object.assign({}, child.props, customProps))
                //return React.cloneElement(component, Object.assign({}, component.props, {infrastructureMode: "component"}))

            }

            return component.props.children;
        }

        // when the component is NOT a custom one, we return it
        return component;

    //});
}

const parseRedirects = (component) => {
    return getChildrenArray(component)
        .filter(child => isRedirect(child))
        .map(child => applyRedirect(child));
};

const applyRedirect = (redirectComponent) => {
    //console.log("redirect: ", redirectComponent.props);
    return redirectComponent.props
};

const parseRoutes = (component) => {
    return getChildrenArray(component)
        .filter(child => isRoute(child))
        .map(child => applyRoute(child, component.props.method));
};

const applyRoute = (routeComponent, method) => {
    //console.log("route: ", routeComponent.props);
    return Object.assign(
        Object.assign({}, routeComponent.props),
        {
            method: method,
            exact: true,
            middlewareCallbacks: (routeComponent.props.middlewareCallbacks !== undefined ?
                routeComponent.props.middlewareCallbacks : []).concat(parseMiddlewares(routeComponent)),
        }
    );
};


export function loadIsoConfigFromComponent(component: any, compileMode: boolean = true) {

    //console.log("child: ", component.props.children.props);

    const addToTopLevelConfig = (c) => {
        // TODO add this to the configuration
        console.log("addToTopLevelConfig: ", c);
    }

    return {
        type: ConfigTypes.ISOMORPHIC,
        isoConfig: {
            middlewares: parseMiddlewares(component),

            clientApps: getChildrenArray(component)
                .map(child => applyCustomComponents(child, addToTopLevelConfig, compileMode))
                .filter(child => isClientApp(child))
                .map(child => applyClientApp(child)),
        },

        ssrConfig: {
            stackName: component.props.stackName,
            buildPath: component.props.buildPath,
            assetsPath: component.props.assetsPath
        }
    }



    /*{
        type: ConfigTypes.ISOMORPHIC,
        isoConfig: {

            middlewares: [
                function log(req, res, next) {
                    console.log("here I am again");

                    next();
                }
            ],

                clientApps: [
                {
                    id: "main",
                    path: "*",
                    method: "GET",
                    routes: [
                        {
                            path: '/',
                            method: "GET",
                            middlewareCallbacks: [
                            ],
                            render: (props) => (<ComponentPage {...props}/>), //<ForceLogin ></ForceLogin>
                        name: 'Infrastructure Components',
                exact: true
        }
        ],
            redirects: [],

                //connectWithDataLayer: connectWithDataLayer,
                //hydrateFromDataLayer: hydrateFromDataLayer,
                middlewareCallbacks: [
                routeMain
            ],

        }
        ]
        }
    }*/
}