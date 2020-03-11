<template>
    <v-menu bottom left>
        <template v-slot:activator="{ on }">
            <v-btn
            icon
            v-on="on"
            >
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </template>

        <slot name="menu"></slot>
    </v-menu>
</template>